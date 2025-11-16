const TransactionType = require('../models/transactionType');
const TransactionCategory = require('../models/transactionCategory');

// Get all transaction types
exports.getTypes = async (req, res) => {
  try {
    const types = await TransactionType.findAll({
      order: [['id', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      message: 'Transaction types retrieved successfully',
      data: types
    });
  } catch (error) {
    console.error('Get types error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get all transaction categories (with optional filter by type_id)
exports.getCategories = async (req, res) => {
  try {
    const { type_id } = req.query;

    const where = {};
    if (type_id) {
      where.type_id = type_id;
    }

    const categories = await TransactionCategory.findAll({
      where,
      include: [{
        model: TransactionType,
        attributes: ['id', 'name', 'description']
      }],
      order: [['type_id', 'ASC'], ['id', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      message: 'Transaction categories retrieved successfully',
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get expense categories only (type_id = 1)
exports.getExpenseCategories = async (req, res) => {
  try {
    const categories = await TransactionCategory.findAll({
      where: { type_id: 1 },
      order: [['id', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      message: 'Expense categories retrieved successfully',
      data: categories
    });
  } catch (error) {
    console.error('Get expense categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// Get income categories only (type_id = 2)
exports.getIncomeCategories = async (req, res) => {
  try {
    const categories = await TransactionCategory.findAll({
      where: { type_id: 2 },
      order: [['id', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      message: 'Income categories retrieved successfully',
      data: categories
    });
  } catch (error) {
    console.error('Get income categories error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};
