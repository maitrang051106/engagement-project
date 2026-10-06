// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @title Engagement registry for a classroom Web3 project
/// @notice Stores public engagement promises and KYC image hashes, never raw ID-card data.
contract Engagement {
    struct EngagementRecord {
        address creator;
        string husbandName;
        string wifeName;
        bytes32 husbandCccdHash;
        bytes32 wifeCccdHash;
        string husbandPromise;
        string wifePromise;
        uint256 timestamp;
    }

    address public owner;
    uint256 public systemFeeWei;

    EngagementRecord[] private engagements;

    event EngagementCreated(
        uint256 indexed engagementId,
        address indexed creator,
        string husbandName,
        string wifeName,
        uint256 timestamp
    );
    event SystemFeeUpdated(uint256 oldFeeWei, uint256 newFeeWei);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event Withdrawn(address indexed owner, uint256 amount);

    error EmptyName();
    error EmptyCccdHash();
    error PromiseTooLong(uint256 words, uint256 maxWords);
    error InsufficientFee(uint256 requiredWei, uint256 sentWei);
    error OnlyOwner();
    error InvalidOwner();
    error WithdrawFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    constructor(uint256 initialSystemFeeWei) {
        owner = msg.sender;
        systemFeeWei = initialSystemFeeWei;
        emit OwnershipTransferred(address(0), msg.sender);
        emit SystemFeeUpdated(0, initialSystemFeeWei);
    }

    function createEngagement(
        string calldata husbandName,
        string calldata wifeName,
        bytes32 husbandCccdHash,
        bytes32 wifeCccdHash,
        string calldata husbandPromise,
        string calldata wifePromise
    ) external payable returns (uint256 engagementId) {
        if (msg.value < systemFeeWei) revert InsufficientFee(systemFeeWei, msg.value);
        if (bytes(husbandName).length == 0 || bytes(wifeName).length == 0) revert EmptyName();
        if (husbandCccdHash == bytes32(0) || wifeCccdHash == bytes32(0)) revert EmptyCccdHash();

        _revertIfPromiseTooLong(husbandPromise);
        _revertIfPromiseTooLong(wifePromise);

        engagementId = engagements.length;
        engagements.push(
            EngagementRecord({
                creator: msg.sender,
                husbandName: husbandName,
                wifeName: wifeName,
                husbandCccdHash: husbandCccdHash,
                wifeCccdHash: wifeCccdHash,
                husbandPromise: husbandPromise,
                wifePromise: wifePromise,
                timestamp: block.timestamp
            })
        );

        emit EngagementCreated(engagementId, msg.sender, husbandName, wifeName, block.timestamp);
    }

    function setSystemFeeWei(uint256 newFeeWei) external onlyOwner {
        uint256 oldFeeWei = systemFeeWei;
        systemFeeWei = newFeeWei;
        emit SystemFeeUpdated(oldFeeWei, newFeeWei);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidOwner();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool ok,) = owner.call{value: balance}("");
        if (!ok) revert WithdrawFailed();
        emit Withdrawn(owner, balance);
    }

    function engagementCount() external view returns (uint256) {
        return engagements.length;
    }

    function getEngagement(uint256 engagementId) external view returns (EngagementRecord memory) {
        return engagements[engagementId];
    }

    function getAllEngagements() external view returns (EngagementRecord[] memory) {
        return engagements;
    }

    function _revertIfPromiseTooLong(string calldata promiseText) private pure {
        uint256 words = _wordCount(bytes(promiseText));
        if (words > 100) revert PromiseTooLong(words, 100);
    }

    function _wordCount(bytes calldata text) private pure returns (uint256 words) {
        bool inWord = false;
        for (uint256 i = 0; i < text.length; i++) {
            bytes1 char = text[i];
            bool isWhitespace = char == 0x20 || char == 0x0a || char == 0x0d || char == 0x09;
            if (isWhitespace) {
                inWord = false;
            } else if (!inWord) {
                words++;
                inWord = true;
            }
        }
    }
}
