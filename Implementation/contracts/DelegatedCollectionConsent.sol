pragma solidity >=0.4.22 <0.7.0;

import "./ProcessingConsent.sol";

/** 
 * @title DelegatedCollectionConsent
 * @dev Extension of CollectionConsent concept to support Delegation of Power (Scalability/UX)
 *      This allows a Data Subject to authorize a "Delegate" (e.g., a wallet provider, 
 *      User Agent, or legal guardian) to manage consents on their behalf.
 */
contract DelegatedCollectionConsent {
   
    //Identities of the actors
    address private dataSubject;
    address private controller;
    address[] private recipients;

    // Delegation mapping: Delegate Address => Is Authorized
    mapping(address => bool) public delegates;

    uint256 data;

    //Consent lifetime
    uint256 beginningDate;
    uint256 expirationDate;

    //Valid flag
    uint8[2] private valid;

    //Erasure flag
    bool private erasure;

    mapping( uint => bool ) private defaultPurposes;
    mapping( address => bool ) private processorsBlacklist;

    //ProcessingConsentContracts
    struct ProcessingConsentStruct{
        bool exists;
        address processingConsentContractAddress;
    }
    mapping( address => ProcessingConsentStruct ) private processingConsentContracts;

    address[] private processors;
    
    event DelegateAdded(address indexed delegate);
    event DelegateRemoved(address indexed delegate);
    event ConsentGranted(address indexed actor);
    event ConsentRevoked(address indexed actor);

    constructor( address _dataController, address[] memory _recipients, uint _data, uint duration, uint[] memory _defaultPurposes ) public {
        dataSubject = msg.sender;
        controller = _dataController;
        recipients = _recipients;
        data = _data;
        beginningDate = block.timestamp;
        expirationDate = beginningDate + duration;

        for( uint i=0; i < _defaultPurposes.length; i++ ){
            defaultPurposes[ _defaultPurposes[i] ] = true;
        }
        
        valid = [1,0];
    }
    
    // --- DELEGATION LOGIC ---

    function addDelegate(address _delegate) external onlyDataSubject {
        delegates[_delegate] = true;
        emit DelegateAdded(_delegate);
    }

    function removeDelegate(address _delegate) external onlyDataSubject {
        delegates[_delegate] = false;
        emit DelegateRemoved(_delegate);
    }

    function isAuthorizedForDS(address _actor) public view returns (bool) {
        return _actor == dataSubject || delegates[_actor];
    }

    // --- MODIFIED CONSENT LOGIC ---

    function newPurpose( address processor, uint processingPurpose, uint _data, uint duration ) external contractValidity onlyController {
        require( !processorsBlacklist[ processor ], "This processor is in the Blacklist.");
        
        ProcessingConsent processingConsentContract;
        if( !processingConsentContracts[processor].exists ){
            processingConsentContract = new ProcessingConsent( controller, dataSubject, processor );
            processingConsentContracts[processor] = ProcessingConsentStruct( true, address(processingConsentContract) );

            processors.push( processor );
        }
        else{
            processingConsentContract = ProcessingConsent( processingConsentContracts[processor].processingConsentContractAddress );
        }

        require( !processingConsentContract.existsPurpose( processingPurpose ), "Processor has already requested to process DS's personal data for this purpose." );

        if( defaultPurposes[ processingPurpose ] )
            processingConsentContract.newPurpose( processingPurpose, _data, duration, 1 );
        else
            processingConsentContract.newPurpose( processingPurpose, _data, duration, 0 );
    }

    /**
     * @dev Grant consent. Allows DS, Delegate, or Controller.
     */
    function grantConsent() external {
        // Check if sender is authorized
        bool isDSOrDelegate = (msg.sender == dataSubject || delegates[msg.sender]);
        bool isController = (msg.sender == controller);

        require( isDSOrDelegate || isController, 'Actor not allowed to do this action.' );
        
        if( isDSOrDelegate ) {
            valid[0] = 1;
            emit ConsentGranted(msg.sender);
        }
        
        if( isController ) {
            valid[1] = 1;
            emit ConsentGranted(msg.sender);
        }
    }
    
    /**
     * @dev Revoke consent. Allows DS, Delegate, or Controller.
     */
    function revokeConsent() external {
        bool isDSOrDelegate = (msg.sender == dataSubject || delegates[msg.sender]);
        bool isController = (msg.sender == controller);

        require( isDSOrDelegate || isController, 'Actor not allowed to do this action.' );
        
        if( isDSOrDelegate ) {
            valid[0] = 0;
            emit ConsentRevoked(msg.sender);
        }
        
        if( isController ) {
            valid[1] = 0;
            emit ConsentRevoked(msg.sender);
        }
    }

    function verify() external view returns( bool ) {
        uint256 timestamp = block.timestamp;
        bool isValid = valid[0] != 0 && valid[1] != 0 && timestamp >= beginningDate && timestamp <= expirationDate;
        return isValid;
    }

    function eraseData() external {
        require(msg.sender == dataSubject || delegates[msg.sender], "Only DS or Delegate can erase");
        erasure = true;
    }

    function modifyData( uint _data ) external {
        require(msg.sender == dataSubject || delegates[msg.sender], "Only DS or Delegate can modify");
        data = _data;
    }

    function revokeConsentPurpose( uint purpose ) external {
        require(msg.sender == dataSubject || delegates[msg.sender], "Only DS or Delegate can revoke purpose");

        address processor;
        for( uint i=0; i < processors.length; i++ ){
            processor =  processors[ i ];
            if( ProcessingConsent( processingConsentContracts[ processor ].processingConsentContractAddress ).verifyDS( purpose ) )
                ProcessingConsent( processingConsentContracts[ processor ].processingConsentContractAddress ).revokeConsent( purpose );
        }
        defaultPurposes[ purpose ] = false;
     }

    function revokeConsentProcessor( address processor ) external {
        require(msg.sender == dataSubject || delegates[msg.sender], "Only DS or Delegate can revoke processor");
        require( processingConsentContracts[ processor ].exists, "Processor is not processing DS's personal data for any purpose." );

        ProcessingConsent( processingConsentContracts[ processor ].processingConsentContractAddress ).revokeAllConsents();
        processorsBlacklist[ processor ] = true;
    }

    function getData() external view returns( uint256 ) {
        return data;
    }

    function getProcessingConsentSC( address processor ) external view returns( address ){
        require( processingConsentContracts[ processor ].exists, "Processor has not requested to process DS's PD." );
        return processingConsentContracts[ processor ].processingConsentContractAddress;
    }

    function getAllProcessors() external view returns( address[] memory ){
        return processors;
    }

    modifier onlyDataSubject(){
        require( msg.sender == dataSubject, 'Only the data Subject is allowed to do this action.' );
        _;
    }
    
    modifier onlyController(){
        require( msg.sender == controller, 'Only the data Controller is allowed to do this action.' );
        _;
    }
    
    modifier contractValidity(){
        uint256 timestamp = block.timestamp;
        require( valid[0] != 0 && valid[1] != 0 && timestamp >= beginningDate && timestamp <= expirationDate, 'Consent constract is not valid.' );
        _;
    }
}
