/* eslint-disable no-console */
const chalk = require('chalk')

const {
  oneHundredThousandEuroInCents,
  oneHundredThousandTokensInWei,
  oneWeekInSec,
  twoWeeksInSec
} = require('./constants')
const { unixTimeWithOffsetInSec } = require('./general.js')

const addBroker = async (
  poaManager,
  params = {
    broker: ''
  },
  txConfig
) => {
  const { broker } = params

  console.log(
    chalk.cyan(
      '\n--------------------------------------------------------------'
    )
  )
  console.log(chalk.cyan(`🚀  Adding broker "${broker}"…\n`))
  await poaManager.addBroker(broker, txConfig)
  console.log(chalk.green(`\n✅  Successfully added broker "${broker}"`))
  console.log(
    chalk.green(
      '------------------------------------------------------------------------\n\n'
    )
  )
}

const deployPoa = async (
  poaManager,
  params = {
    name: 'POA Test Token',
    symbol: 'BBK-RE-DE123',
    fiatCurrency: 'EUR',
    totalSupply: oneHundredThousandTokensInWei,
    startTimeForEthFundingPeriod: unixTimeWithOffsetInSec(60),
    durationForEthFundingPeriod: oneWeekInSec,
    durationForActivationPeriod: twoWeeksInSec,
    fundingGoalInCents: oneHundredThousandEuroInCents
  },
  txConfig = {}
) => {
  const {
    name,
    symbol,
    fiatCurrency,
    custodian,
    totalSupply,
    startTimeForEthFundingPeriod,
    durationForEthFundingPeriod,
    durationForActivationPeriod,
    fundingGoalInCents
  } = params

  console.log(
    chalk.cyan(
      '\n--------------------------------------------------------------------'
    )
  )
  console.log(
    chalk.cyan(`🚀  Deploying POA "${name}" with symbol "${symbol}"…\n`)
  )
  const tx = await poaManager.addToken(
    name,
    symbol,
    fiatCurrency,
    custodian,
    totalSupply,
    startTimeForEthFundingPeriod,
    durationForEthFundingPeriod,
    durationForActivationPeriod,
    fundingGoalInCents,
    txConfig
  )
  const poaAddress = tx.logs[0].args.token
  console.log(
    chalk.green(
      `\n✅  Successfully deployed POA "${symbol}" to "${poaAddress}"`
    )
  )
  console.log(
    chalk.green(
      '-------------------------------------------------------------------------------------------\n\n'
    )
  )
}

module.exports = {
  addBroker,
  deployPoa
}
