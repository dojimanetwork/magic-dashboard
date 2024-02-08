export const OmniChainNftContractTemplate = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@dojimanetwork/dojima-contracts/contracts/interfaces/IOutboundStateSender.sol';
import '@dojimanetwork/dojima-contracts/contracts/interfaces/IStateReceiver.sol';
import '@dojimanetwork/dojima-contracts/contracts/dojimachain/StateSyncerVerifier.sol';
import './XNFTContract.sol'; // Your ERC721 contract

contract OmniChainNFTContract is Initializable, UUPSUpgradeable, IStateReceiver, ReentrancyGuardUpgradeable, AccessControl {
    XNFTContract public xNFT;
    IOutboundStateSender public outboundStateSender;
    StateSyncerVerifier private _stateVerifier;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Mapping of chain names to their contract addresses in bytes format
    mapping(bytes32 => bytes) public chainContractMappings;

    event ChainContractMappingUpdated(bytes32 chainName, bytes contractAddress);
    event NFTsTransferredToChain(bytes32 destinationChain, bytes user, uint256 tokenId);

    modifier onlyStateSyncer() {
        require(msg.sender == address(_stateVerifier.stateSyncer()), "OmniChainNFTContract: Caller is not the state syncer");
        _;
    }

    // Roles and other state variables
    function initialize(address _xNFTAddress, address _outboundStateSender, address _stateSyncerVerifier) public initializer {
        require(_outboundStateSender != address(0), "OmniChainNFTContract: OutboundStateSender address cannot be zero");
        require(_stateSyncerVerifier != address(0), "OmniChainNFTContract: Invalid state syncer verifier address");
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        xNFT = XNFTContract(_xNFTAddress);
        _setupRole(ADMIN_ROLE, msg.sender);
        outboundStateSender = IOutboundStateSender(_outboundStateSender);
        _stateVerifier = StateSyncerVerifier(_stateSyncerVerifier);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(ADMIN_ROLE) {
        // Upgrade authorization logic
    }

    function updateChainContractMapping(bytes32 chainName, bytes memory contractAddress) external onlyRole(ADMIN_ROLE) {
        chainContractMappings[chainName] = contractAddress;
        emit ChainContractMappingUpdated(chainName, contractAddress);
    }

    // Functions for transferring NFTs to other chains
    function transferToChain(
        bytes32 destinationChain,
        bytes memory user,
        uint256 tokenId,
        bytes memory destinationContractAddress
    ) external nonReentrant {
        require(
            keccak256(destinationContractAddress) == keccak256(chainContractMappings[destinationChain]),
            "OmniChainNFTContract: Destination contract address does not match"
        );

        xNFT.burn(tokenId);
        outboundStateSender.transferPayload(
            destinationChain,
            destinationContractAddress,
            msg.sender,
            abi.encode(user, tokenId, 0) // TODO: add depositId
        );

        emit NFTsTransferredToChain(destinationChain, user, tokenId);
    }

    // Functions for receiving NFT state from other chains
    // Additional NFT-specific functionalities
    function onStateReceive(uint256 /* id */, bytes calldata data) external onlyStateSyncer {
        (bytes memory userBytes, uint256 tokenId, uint256 depositId ) = abi.decode(data, (bytes, uint256, uint256));
        // Ensure the bytes array for the address is of the correct length
        require(userBytes.length == 20, "OmniChainNFTContract: Invalid address length");

        address userAddress;
        assembly {
            userAddress := mload(add(userBytes, 20))
        }

        // Additional validation for the address can go here if needed
        require(userAddress != address(0), "OmniChainNFTContract: Invalid address");

        xNFT.mint(userAddress, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}`;
