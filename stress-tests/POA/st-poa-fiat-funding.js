const logger = require('../../scripts/lib/logger')
const BigNumber = require('bignumber.js')
const { table } = require('table')
const {
  getRandomBigInt,
  timeTravel,
  gasPrice,
  testWillThrow
} = require('../../test/helpers/general')
const chalk = require('chalk')

const {
  determineNeededTimeTravel,
  setupPoaProxyAndEcosystem,
  testStartFiatSale,
  broker,
  custodian,
  testBuyTokensWithFiat,
  getRemainingAmountInCentsDuringFiatFunding,
  testUpdateProofOfCustody,
  defaultIpfsHashArray32,
  testPayActivationFee,
  testActivate,
  testBrokerClaim,
  testClaimAllPayouts,
  testPayout
} = require('../../test/helpers/poa')

const {
  InvestmentRegistry,
  fundFiatUntilRemainingTarget
} = require('../helpers/st-poa-helper')

describe('POAToken Stress Tests - test fiat funding only', () => {
  contract('PoaToken', accounts => {
    const fiatInvestors = accounts.slice(4, accounts.length)

    const fundingGoal = new BigNumber(1e9) // 10.000.000 EUR
    const investmentRegistry = new InvestmentRegistry()

    let fmr
    let poa

    let totalPayout = new BigNumber(0)

    before('setup contracts', async () => {
      const contracts = await setupPoaProxyAndEcosystem({
        _fundingGoal: fundingGoal
      })

      fmr = contracts.fmr
      poa = contracts.poa

      const neededTime = await determineNeededTimeTravel(poa)

      await timeTravel(neededTime)
      await testStartFiatSale(poa, { from: broker, gasPrice })
    })

    it('Should fund with random amounts with many investors', async () => {
      await fundFiatUntilRemainingTarget(
        poa,
        fundingGoal
          .div(100)
          .mul(2)
          .floor(),
        custodian,
        gasPrice,
        fiatInvestors,
        investmentRegistry
      )

      const remainingFundableAmount = await getRemainingAmountInCentsDuringFiatFunding(
        poa
      )

      logger.info(
        `Remaining fundable amount: ${remainingFundableAmount.toString()}`,
        {
          scope: 'Fiat funding'
        }
      )

      await testBuyTokensWithFiat(
        poa,
        fiatInvestors[0],
        remainingFundableAmount,
        {
          from: custodian,
          gasPrice
        }
      )
    })

    it('should activate', async () => {
      await testPayActivationFee(poa, fmr)

      await testUpdateProofOfCustody(poa, defaultIpfsHashArray32, {
        from: custodian
      })

      await testActivate(poa, fmr, {
        from: custodian
      })
    })

    it('should payout amny times', async () => {
      for (let i = 0; i < 10; i++) {
        const payout = getRandomBigInt(new BigNumber(1e18), new BigNumber(3e18))
        await testPayout(poa, fmr, {
          from: broker,
          value: getRandomBigInt(new BigNumber(1e18), new BigNumber(3e18)),
          gasPrice
        })
        totalPayout = totalPayout.add(payout)
      }
    })

    it('should NOT let Broker Claim, because there are no ETH funders', async () => {
      await testWillThrow(testBrokerClaim, [poa])
    })

    it('should let investors claim', async () => {
      await testClaimAllPayouts(poa, investmentRegistry.getInvestorAddresses())
    })

    it('should siplay analytics data', () => {
      const data = [['Funding Goal', fundingGoal.div(100).toString()]]

      data.push(['Total Investors', investmentRegistry.length])
      data.push(['Total Payout', totalPayout.toString()])

      // eslint-disable-next-line
      console.log(table(data))
    })
  })
})
