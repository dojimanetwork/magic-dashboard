export const XNftContractTemplate = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract XNFTContract is ERC721Burnable, AccessControl {
    address public omniChainNFTContract;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event OmniChainNFTContractUpdated(address omniChainContract);

    constructor(string memory name, string memory symbol) ERC721(name, symbol) {
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    function setOmniChainContract(address _omniChainNFTContract) external onlyRole(ADMIN_ROLE) {
        omniChainNFTContract = _omniChainNFTContract;
        emit OmniChainNFTContractUpdated(_omniChainNFTContract);
    }

    modifier onlyOmniChainNFTContract() {
        require(msg.sender == omniChainNFTContract, "XNFTContract: Unauthorized");
        _;
    }

    function mint(address to, uint256 tokenId) public onlyOmniChainNFTContract {
        _safeMint(to, tokenId);
    }

    // Optional: Override 'burn' if additional logic is needed
     function burn(uint256 tokenId) public override onlyOmniChainNFTContract {
         _burn(tokenId);
     }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
`;
