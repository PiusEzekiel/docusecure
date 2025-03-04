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
    function getAllDocuments() public view returns (
    string[] memory hashes,
    address[] memory owners,
    uint256[] memory timestamps,
    string[] memory metadataList,
    string[] memory ipfsHashes
) {
    uint256 length = documentHashes.length;
    hashes = new string[](length);
    owners = new address[](length);
    timestamps = new uint256[](length);
    metadataList = new string[](length);
    ipfsHashes = new string[](length);

    for (uint256 i = 0; i < length; i++) {
        Document memory doc = documents[documentHashes[i]];
        hashes[i] = doc.hash;
        owners[i] = doc.owner;
        timestamps[i] = doc.timestamp;
        metadataList[i] = doc.metadata;
        ipfsHashes[i] = doc.ipfsHash;
    }

    return (hashes, owners, timestamps, metadataList, ipfsHashes);
}

}
