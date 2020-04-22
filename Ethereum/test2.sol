pragma solidity >=0.4.22 <0.6.0;

contract test2 {
    string public var1 = "hello world, this is practice contract";

    function setString(string memory _var1) public {
        var1 = _var1;
    }
}
