pragma solidity 0.6.12;

contract Mathematics {

    uint public answer;

    function add(uint value1, uint value2, uint value3) public {
        answer = value1 + value2 + value3;
    }
    
    function subtract(uint value1, uint value2) public {
        answer = value1 - value2;
    }
    
    function multiply(uint value1, uint value2, uint value3, uint value4) public {
        answer = value1 * value2 * value3 * value4;
    }

    function divide(uint value1, uint value2) public {
        // require(value2 != 0);
        answer = value1/value2;
    }
}