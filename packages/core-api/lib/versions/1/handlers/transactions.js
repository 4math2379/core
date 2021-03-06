'use strict'

const container = require('@arkecosystem/core-container')
const database = container.resolvePlugin('database')
const transactionPool = container.resolvePlugin('transactionPool')

const utils = require('../utils')
const schema = require('../schemas/transactions')

/**
 * @type {Object}
 */
exports.index = {
  /**
   * @param  {Hapi.Request} request
   * @param  {Hapi.Toolkit} h
   * @return {Hapi.Response}
   */
  async handler (request, h) {
    const { count, rows } = await database.transactions.findAllLegacy({
      ...request.query, ...utils.paginator(request)
    })

    if (!rows) {
      return utils.respondWith('No transactions found', true)
    }

    return utils.respondWith({
      transactions: utils.toCollection(request, rows, 'transaction'),
      count
    })
  },
  config: {
    plugins: {
      'hapi-ajv': {
        querySchema: schema.getTransactions
      }
    }
  }
}

/**
 * @type {Object}
 */
exports.show = {
  /**
   * @param  {Hapi.Request} request
   * @param  {Hapi.Toolkit} h
   * @return {Hapi.Response}
   */
  async handler (request, h) {
    const result = await database.transactions.findById(request.query.id)

    if (!result) {
      return utils.respondWith('No transactions found', true)
    }

    return utils.respondWith({
      transaction: utils.toResource(request, result, 'transaction')
    })
  },
  config: {
    plugins: {
      'hapi-ajv': {
        querySchema: schema.getTransaction
      }
    }
  }
}

/**
 * @type {Object}
 */
exports.unconfirmed = {
  /**
   * @param  {Hapi.Request} request
   * @param  {Hapi.Toolkit} h
   * @return {Hapi.Response}
   */
  async handler (request, h) {
    const pagination = utils.paginate(request)
    const transactions = await transactionPool.getTransactions(pagination.offset, pagination.limit)

    return utils.toPagination({
      count: transactions.length,
      rows: transactions
    }, transactions, 'transaction')
  }
}

/**
 * @type {Object}
 */
exports.showUnconfirmed = {
  /**
   * @param  {Hapi.Request} request
   * @param  {Hapi.Toolkit} h
   * @return {Hapi.Response}
   */
  async handler (request, h) {
    const transaction = await transactionPool.getTransaction(request.param.id)

    return utils.respondWithResource(request, transaction, 'transaction')
  }
}
