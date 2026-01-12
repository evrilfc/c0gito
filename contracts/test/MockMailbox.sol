// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal mock Mailbox used only for unit tests.
/// It implements the subset of the Hyperlane Mailbox ABI that our contracts use.
contract MockMailbox {
    event DispatchCalled(
        uint32 indexed destinationDomain,
        bytes32 indexed recipient,
        bytes message
    );

    // Hyperlane Mailbox public state used by MailboxClient
    uint32 public localDomain = 5003; // arbitrary test domain
    bytes32 public latestDispatchedId;
    mapping(bytes32 => bool) public delivered;

    // Address that `processor()` will return for any message id
    address public processorAddress;

    constructor() {
        processorAddress = address(this);
    }

    function setProcessorAddress(address _processor) external {
        processorAddress = _processor;
    }

    // Matches the simple dispatch signature used by Router._Router_dispatch
    function dispatch(
        uint32 _destinationDomain,
        bytes32 _recipientAddress,
        bytes calldata _messageBody
    ) external payable returns (bytes32) {
        bytes32 id = keccak256(
            abi.encodePacked(_destinationDomain, _recipientAddress, _messageBody, block.number)
        );
        latestDispatchedId = id;
        delivered[id] = true;
        emit DispatchCalled(_destinationDomain, _recipientAddress, _messageBody);
        return id;
    }

    // Overload with hook metadata + hook address to match full Mailbox ABI
    function dispatch(
        uint32 destinationDomain,
        bytes32 recipientAddress,
        bytes calldata messageBody,
        bytes calldata /*hookMetadata*/,
        address /*hook*/
    ) external payable returns (bytes32) {
        bytes32 id = keccak256(
            abi.encodePacked(destinationDomain, recipientAddress, messageBody, block.number, uint8(1))
        );
        latestDispatchedId = id;
        delivered[id] = true;
        emit DispatchCalled(destinationDomain, recipientAddress, messageBody);
        return id;
    }

    // Method used by TrustedRelayerIsm to check the processor for a message id
    function processor(bytes32 /*_id*/) external view returns (address) {
        return processorAddress;
    }
}

