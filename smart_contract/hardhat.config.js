require('@nomicfoundation/hardhat-toolbox')

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.17',
  networks: {
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/O03SlmN9nfpWwdXiEQAAQf8SI3bcjhTF',
      accounts: [
        '0eaa58eb782a6f0580c2d3cde5c63d9f466fe211f7bb418880b3028eb0a70785'
      ]
    }
  }
}
