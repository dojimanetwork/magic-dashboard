export const EthereumCrossChainNftTemplate = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';
import '@dojimanetwork/dojima-contracts/contracts/interfaces/IInboundStateSender.sol';
import {IStateExecutor} from '@dojimanetwork/dojima-contracts/contracts/interfaces/IStateReceiver.sol';

contract EthereumCrossChainNFT is IStateExecutor, Initializable, ERC721Upgradeable, UUPSUpgradeable, AccessControlUpgradeable, ReentrancyGuardUpgradeable {
    bytes32 public constant EXECUTE_STATE_ROLE = keccak256("EXECUTE_STATE_ROLE");

    IInboundStateSender public inboundStateSender;
    address public omniChainNFTContractAddress;

    event NFTDeposited(
        address indexed user,
        address nft,
        uint256 tokenId,
        uint256 indexed depositId
    );

    function initialize(
        string memory _name,
        string memory _symbol,
        address _inboundStateSender,
        address _omniChainNFTContractAddress
    ) public initializer {
        require(_inboundStateSender != address(0), "EthereumCrossChainToken: InboundStateSender address cannot be zero");
        require(_omniChainNFTContractAddress != address(0), "EthereumCrossChainToken: OmniChain contract address cannot be zero");

        __ERC721_init(_name, _symbol);
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        inboundStateSender = IInboundStateSender(_inboundStateSender);
        omniChainNFTContractAddress = _omniChainNFTContractAddress;
        _setupRole(EXECUTE_STATE_ROLE, _inboundStateSender);
    }

    function transferToOmniChain(address user, uint256 tokenId) external nonReentrant {
        _burn(tokenId);
        inboundStateSender.transferPayload(omniChainNFTContractAddress, abi.encode(user, tokenId, 0));
    }

    function executeState(uint256 /*depositID*/, bytes calldata stateData) external nonReentrant onlyRole(EXECUTE_STATE_ROLE) {
        (address userAddress, uint256 tokenId, uint256 depositId) = abi.decode(stateData, (address, uint256, uint256));

        _mint(userAddress, tokenId);
        emit NFTDeposited(userAddress, address(this), tokenId, depositId);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {
        // Upgrade authorization logic
    }


    function supportsInterface(bytes4 interfaceId) public view override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}`