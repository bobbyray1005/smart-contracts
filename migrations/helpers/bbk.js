/* eslint-disable no-console */
const chalk = require('chalk')

const distributeBbkToMany = async (
  BrickblockToken,
  contributors,
  amount,
  txConfig = { from: null, gas: null }
) => {
  for (let index = 0; index < contributors.length; index++) {
    const address = contributors[index]
    await BrickblockToken.distributeTokens(address, amount, txConfig)
  }
}

const finalizeBbkCrowdsale = async (
  BrickblockToken,
  params = {
    contributors: [],
    fountainAddress: null,
    tokenAmountPerContributor: null
  },
  txConfig = {
    from: null,
    gas: null
  }
) => {
  const {
    contributors,
    fountainAddress,
    tokenAmountPerContributor,
    network
  } = params

  console.log(chalk.cyan('\n------------------------------'))
  console.log(chalk.cyan('🚀  Finalizing BBK crowdsale…'))

  console.log(
    chalk.yellow(
      `\n➡️   Changing fountainContractAddress to ${fountainAddress}…`
    )
  )
  await BrickblockToken.changeFountainContractAddress(fountainAddress, txConfig)

  if (network !== 'mainnet') {
    console.log(
      chalk.yellow(
        `\n➡️   Distributing ${tokenAmountPerContributor.toString()} BBK each to ${contributors.toString()}…`
      )
    )
    await distributeBbkToMany(
      BrickblockToken,
      contributors,
      tokenAmountPerContributor,
      txConfig
    )
  }

  console.log(chalk.yellow('\n➡️   Finalizing token sale…'))
  await BrickblockToken.finalizeTokenSale(txConfig)

  console.log(chalk.yellow('\n➡️   Unpausing BBK…'))
  await BrickblockToken.unpause(txConfig)

  console.log(chalk.green('\n✅  Successfully finalized BBK crowdsale'))
  console.log(chalk.green('------------------------------------------\n\n'))
}

module.exports = {
  finalizeBbkCrowdsale
}
