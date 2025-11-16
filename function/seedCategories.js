const TransactionType = require('../models/transactionType');
const TransactionCategory = require('../models/transactionCategory');

// ฟังก์ชันสำหรับสร้างข้อมูล Transaction Types และ Categories
async function seedCategories() {
  try {
    console.log('🔍 Checking transaction types and categories...');

    // 1. เช็คและสร้าง Transaction Types
    const typeCount = await TransactionType.count();
    
    if (typeCount === 0) {
      console.log('📝 Creating transaction types...');
      
      await TransactionType.bulkCreate([
        { id: 1, name: 'expense', description: 'รายจ่าย' },
        { id: 2, name: 'income', description: 'รายรับ' }
      ]);
      
      console.log('✅ Transaction types created successfully');
    } else {
      console.log(`✅ Transaction types already exist (${typeCount} types)`);
    }

    // 2. เช็คและสร้าง Transaction Categories
    const categoryCount = await TransactionCategory.count();
    
    if (categoryCount === 0) {
      console.log('📝 Creating transaction categories...');
      
      await TransactionCategory.bulkCreate([
        // รายจ่าย (type_id = 1)
        { type_id: 1, name: 'ค่าพันธุ์พืช', description: 'ค่าใช้จ่ายในการซื้อเมล็ดพันธุ์หรือต้นกล้า' },
        { type_id: 1, name: 'ค่าปุ๋ย', description: 'ค่าใช้จ่ายในการซื้อปุ๋ยเคมีหรือปุ๋ยอินทรีย์' },
        { type_id: 1, name: 'ค่ายาฆ่าแมลง', description: 'ค่าใช้จ่ายในการซื้อยาปราบศัตรูพืช' },
        { type_id: 1, name: 'ค่าจ้างแรงงาน', description: 'ค่าจ้างคนงานในการปลูก ดูแล หรือเก็บเกี่ยว' },
        { type_id: 1, name: 'ค่าเครื่องจักร', description: 'ค่าเช่าหรือค่าน้ำมันเครื่องจักรการเกษตร' },
        { type_id: 1, name: 'ค่าน้ำ', description: 'ค่าใช้จ่ายในการจัดหาน้ำสำหรับรดพืช' },
        { type_id: 1, name: 'ค่าไฟฟ้า', description: 'ค่าไฟฟ้าสำหรับปั๊มน้ำหรืออุปกรณ์' },
        { type_id: 1, name: 'อื่นๆ', description: 'ค่าใช้จ่ายอื่นๆ' },
        
        // รายรับ (type_id = 2)
        { type_id: 2, name: 'ขายผลผลิต', description: 'รายได้จากการขายผลผลิตการเกษตร' },
        { type_id: 2, name: 'เงินอุดหนุน', description: 'เงินอุดหนุนจากภาครัฐหรือองค์กร' },
        { type_id: 2, name: 'อื่นๆ', description: 'รายรับอื่นๆ' }
      ]);
      
      console.log('✅ Transaction categories created successfully (11 categories)');
    } else {
      console.log(`✅ Transaction categories already exist (${categoryCount} categories)`);
    }

    // 3. แสดงข้อมูลที่มีอยู่
    const types = await TransactionType.findAll();
    const categories = await TransactionCategory.findAll({
      include: [{ model: TransactionType, attributes: ['name'] }]
    });

    console.log('\n📊 Available Transaction Types:');
    types.forEach(type => {
      console.log(`   - ${type.id}: ${type.name} (${type.description})`);
    });

    console.log('\n📊 Available Transaction Categories:');
    const expenseCategories = categories.filter(c => c.type_id === 1);
    const incomeCategories = categories.filter(c => c.type_id === 2);

    console.log('   รายจ่าย (Expense):');
    expenseCategories.forEach(cat => {
      console.log(`   - ${cat.id}: ${cat.name}`);
    });

    console.log('   รายรับ (Income):');
    incomeCategories.forEach(cat => {
      console.log(`   - ${cat.id}: ${cat.name}`);
    });

    console.log('\n✅ Categories initialization completed!\n');

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

module.exports = { seedCategories };
