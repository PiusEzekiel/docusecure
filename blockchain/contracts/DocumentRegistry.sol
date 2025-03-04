// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DocumentRegistry {
    struct Document {
        string hash;       // Unique document hash
        address owner;     // Owner's Ethereum address
        uint256 timestamp; // Time of registration
        string metadata;   // Additional metadata
        string ipfsHash;   // IPFS file hash
    }

    mapping(string => Document) private documents;
    string[] private documentHashes; // Store all document hashes for UI retrieval

    event DocumentRegistered(string hash, address owner, uint256 timestamp, string metadata, string ipfsHash);
    event OwnershipTransferred(string hash, address oldOwner, address newOwner);

    // 🔹 Register a new document with IPFS support
    function registerDocument(string memory _hash, string memory _metadata, string memory _ipfsHash) public {
        require(documents[_hash].owner == address(0), "Error: Document already registered");

        documents[_hash] = Document(_hash, msg.sender, block.timestamp, _metadata, _ipfsHash);
        documentHashes.push(_hash); // Store hash in array
        emit DocumentRegistered(_hash, msg.sender, block.timestamp, _metadata, _ipfsHash);
    }

    // 🔹 Transfer ownership of a document
    function transferOwnership(string memory _hash, address _newOwner) public {
        require(documents[_hash].owner == msg.sender, "Error: Only the owner can transfer ownership");
        require(_newOwner != address(0), "Error: Invalid new owner address");

        documents[_hash].owner = _newOwner;
        emit OwnershipTransferred(_hash, msg.sender, _newOwner);
    }

    // 🔹 Verify a document’s authenticity
    function verifyDocument(string memory _hash) public view returns (address, uint256, string memory, string memory) {
        require(documents[_hash].owner != address(0), "Error: Document not found");

        Document memory doc = documents[_hash];
        return (doc.owner, doc.timestamp, doc.metadata, doc.ipfsHash);
    }

    // 🔹 Get all registered documents (for UI)
    function getAllDocuments() public view returns (Document[] memory) {
        Document[] memory docs = new Document[](documentHashes.length);
        for (uint i = 0; i < documentHashes.length; i++) {
            docs[i] = documents[documentHashes[i]];
        }
        return docs;
    }
}
