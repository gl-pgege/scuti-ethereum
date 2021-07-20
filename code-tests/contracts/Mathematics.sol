pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

contract Mathematics {

    struct Book {
        string title;
        string author;
        uint book_id;
    }

    mapping(string => uint) public answers;

    uint public answer;
    uint public random;

    Book public book;

    function add(uint value1, uint value2, uint value3) public {
        answers["add"] = value1 + value2 + value3;
    }
    
    function subtract(uint value1, uint value2) public {
        answers["subtract"] = value1 - value2;
    }
    
    function multiply(uint value1, uint value2, uint value3, uint value4) public {
        answers["multiply"] = value1 * value2 * value3 * value4;
    }

    function addBook(Book memory _book) public {
        book = _book;
    }

    function divide(uint value1, uint value2) public {
        require(value2 != 0);
        answers["divide"] = value1/value2;
    }
}