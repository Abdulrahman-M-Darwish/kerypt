require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    rinkeby: {
      url: "https://eth-rinkeby.alchemyapi.io/v2/7SMxd2veSQzZBRNlT5zU2irnLqlvz7_C",
      accounts: [
        "d333475dda675e7014ad70f8889f2fbe70a192cb68add883a3a545c3bd2d292a",
      ],
    },
  },
};
