pragma solidity ^0.4.4;

import 'zeppelin-solidity/contracts/token/BurnableToken.sol';

contract BrickBlockFountain is BurnableToken {
  string public test;
  function BurnableToken(string _test) {
    test = _test;
  }
}
