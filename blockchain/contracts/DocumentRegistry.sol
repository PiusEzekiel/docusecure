// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DocumentRegistry {
    struct Document {
        string hash;
        address owner;
        uint256 timestamp;
        string metadata;
    }

    mapping(string => Document) private documents;
    string[] private documentHashes; // Store all document hashes for UI retrieval

    event DocumentRegistered(string hash, address owner, uint256 timestamp, string metadata);
    event OwnershipTransferred(string hash, address oldOwner, address newOwner);

    // 🔹 Register a new document with metadata
    function registerDocument(string memory _hash, string memory _metadata) public {
        require(documents[_hash].owner == address(0), "Error: Document already registered");

        documents[_hash] = Document(_hash, msg.sender, block.timestamp, _metadata);
        documentHashes.push(_hash); // Store hash in array
        emit DocumentRegistered(_hash, msg.sender, block.timestamp, _metadata);
    }

    // 🔹 Transfer ownership of a document
    function transferOwnership(string memory _hash, address _newOwner) public {
        require(documents[_hash].owner == msg.sender, "Error: Only the owner can transfer ownership");
        require(_newOwner != address(0), "Error: Invalid new owner address");

        documents[_hash].owner = _newOwner;
        emit OwnershipTransferred(_hash, msg.sender, _newOwner);
    }

    // 🔹 Verify a document’s authenticity
    function verifyDocument(string memory _hash) public view returns (address, uint256, string memory) {
        require(documents[_hash].owner != address(0), "Error: Document not found");

        Document memory doc = documents[_hash];
        return (doc.owner, doc.timestamp, doc.metadata);
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
