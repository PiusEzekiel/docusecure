// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DocumentRegistry {
    struct Document {
        string hash;
        address owner;
        uint256 timestamp;
        string metadata;
        string cid; // Change from ipfsHash to CID
    }

    mapping(string => Document) private documents;
    string[] private documentHashes; // Array to store document hashes

    // Events
    event DocumentRegistered(string hash, address owner, uint256 timestamp, string metadata, string cid);
    event OwnershipTransferred(string hash, address oldOwner, address newOwner);

    // Register a document with CID
    function registerDocument(string memory _hash, string memory _metadata, string memory _cid) public {
        require(bytes(_hash).length > 0, "Error: Hash cannot be empty");
        require(bytes(_metadata).length > 0, "Error: Metadata cannot be empty");
        require(bytes(_cid).length > 0, "Error: CID cannot be empty");
        require(documents[_hash].owner == address(0), "Error: Document already registered");

        documents[_hash] = Document(_hash, msg.sender, block.timestamp, _metadata, _cid);
        documentHashes.push(_hash);
        emit DocumentRegistered(_hash, msg.sender, block.timestamp, _metadata, _cid);
    }

    // Transfer ownership of a document
    function transferOwnership(string memory _hash, address _newOwner) public {
        require(documents[_hash].owner == msg.sender, "Error: Only the owner can transfer ownership");
        require(_newOwner != address(0), "Error: Invalid new owner address");

        documents[_hash].owner = _newOwner;
        emit OwnershipTransferred(_hash, msg.sender, _newOwner);
    }

    // Verify a document
    function verifyDocument(string memory _hash) public view returns (
    address owner, 
    uint256 timestamp, 
    string memory metadata, 
    string memory cid  // Changed from ipfsHash to cid
) {
    require(documents[_hash].owner != address(0), "Error: Document not found");
    Document memory doc = documents[_hash];
    return (doc.owner, doc.timestamp, doc.metadata, doc.cid); // Returning CID
}


    // Get all documents
    function getAllDocuments() public view returns (
        string[] memory hashes,
        address[] memory owners,
        uint256[] memory timestamps,
        string[] memory metadataList,
        string[] memory cids
    ) {
        uint256 length = documentHashes.length;
        
        hashes = new string[](length);
        owners = new address[](length);
        timestamps = new uint256[](length);
        metadataList = new string[](length);
        cids = new string[](length);
        
        for (uint256 i = 0; i < length; i++) {
            string memory currentHash = documentHashes[i];
            Document memory doc = documents[currentHash];
            
            hashes[i] = doc.hash;
            owners[i] = doc.owner;
            timestamps[i] = doc.timestamp;
            metadataList[i] = doc.metadata;
            cids[i] = doc.cid;
        }
        
        return (hashes, owners, timestamps, metadataList, cids);
    }

    // Fetch all documents owned by a specific user
function getDocumentsByOwner(address _owner) public view returns (
    string[] memory hashes,
    string[] memory metadataList,
    uint256[] memory timestamps,
    string[] memory cids
) {
    uint256 count = 0;
    for (uint i = 0; i < documentHashes.length; i++) {
        if (documents[documentHashes[i]].owner == _owner) {
            count++;
        }
    }

    hashes = new string[](count);
    metadataList = new string[](count);
    timestamps = new uint256[](count);
    cids = new string[](count);

    uint index = 0;
    for (uint i = 0; i < documentHashes.length; i++) {
        if (documents[documentHashes[i]].owner == _owner) {
            hashes[index] = documents[documentHashes[i]].hash;
            metadataList[index] = documents[documentHashes[i]].metadata;
            timestamps[index] = documents[documentHashes[i]].timestamp;
            cids[index] = documents[documentHashes[i]].cid;
            index++;
        }
    }

    return (hashes, metadataList, timestamps, cids);
}

}
