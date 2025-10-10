// Demo Data Setup for Role-Based Authentication System
// Run this in browser console to populate test data

const setupDemoData = () => {
  // Demo Data Setup Script
// Run this in the browser console at localhost:8082 to populate demo data

console.log('� Setting up Blue Carbon Registry Demo Data...');

// NGO Test Account Address
const NGO_ADDRESS = '0x24cF2631Cd812089e14da2Bb6d7A7C5505258656';
const COMPANY_ADDRESS = '0x8ba1f109551bD432803012645Hac136c82C5761';

// Sample NGO Projects
const sampleProjects = [
  {
    id: "1703001234567",
    title: "Mangrove Restoration in Sundarbans",
    description: "Large-scale mangrove restoration project in the Sundarbans region focusing on biodiversity conservation and carbon sequestration. This project aims to restore 500 hectares of degraded mangrove forest through community-based conservation efforts.",
    location: "Sundarbans, West Bengal, India",
    expectedCredits: 1750,
    status: "approved",
    submittedDate: "12/19/2024",
    allocatedCredits: 1750,
    auditNotes: "Excellent project proposal with clear methodology and community involvement. Approved for full credit allocation.",
    auditDate: "12/20/2024"
  },
  {
    id: "1703001234568", 
    title: "Seagrass Meadow Conservation - Florida Bay",
    description: "Protection and restoration of seagrass meadows in Florida Bay. The project includes monitoring water quality, controlling invasive species, and replanting native seagrass species to enhance carbon storage capacity.",
    location: "Florida Bay, Florida, USA",
    expectedCredits: 850,
    status: "pending",
    submittedDate: "12/21/2024"
  },
  {
    id: "1703001234569",
    title: "Salt Marsh Ecosystem Rehabilitation",
    description: "Comprehensive salt marsh rehabilitation project on the Atlantic coast focusing on tidal flow restoration and native vegetation replanting to maximize blue carbon potential.",
    location: "Chesapeake Bay, Maryland, USA", 
    expectedCredits: 650,
    status: "pending",
    submittedDate: "12/22/2024"
  }
];

// Sample marketplace offers (credits for sale)
const marketplaceOffers = [
  {
    ngoAddress: NGO_ADDRESS,
    ngoName: "Ocean Conservation NGO",
    credits: 500,
    pricePerCredit: 25.50,
    totalPrice: 500 * 25.50,
    timestamp: new Date().toISOString()
  },
  {
    ngoAddress: NGO_ADDRESS,
    ngoName: "Ocean Conservation NGO", 
    credits: 250,
    pricePerCredit: 28.00,
    totalPrice: 250 * 28.00,
    timestamp: new Date().toISOString()
  }
];

// Sample company purchases
const companyPurchases = [
  {
    id: "purchase_1703001234570",
    offerId: "offer_1", 
    ngoName: "Ocean Conservation NGO",
    credits: 300,
    totalPrice: 7650,
    purchaseDate: "12/18/2024",
    status: "completed"
  }
];

try {
  // Set up NGO projects
  localStorage.setItem(`ngo_projects_${NGO_ADDRESS}`, JSON.stringify(sampleProjects));
  console.log('✅ NGO projects created:', sampleProjects.length);

  // Set up NGO allocated credits (from approved projects)
  const totalAllocatedCredits = sampleProjects
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + (p.allocatedCredits || 0), 0);
  localStorage.setItem(`ngo_credits_${NGO_ADDRESS}`, totalAllocatedCredits.toString());
  console.log('✅ NGO allocated credits:', totalAllocatedCredits);

  // Set up marketplace offers
  localStorage.setItem('marketplace_offers', JSON.stringify(marketplaceOffers));
  console.log('✅ Marketplace offers created:', marketplaceOffers.length);

  // Set up company purchases
  localStorage.setItem(`company_purchases_${COMPANY_ADDRESS}`, JSON.stringify(companyPurchases));
  console.log('✅ Company purchase history created:', companyPurchases.length);

  console.log('\n🎉 Demo data setup complete!');
  console.log('\n📋 What you can now test:');
  console.log('👥 NGO Dashboard: View 3 projects (1 approved, 2 pending), see 1750 allocated credits');
  console.log('🔍 Auditor Dashboard: Review 2 pending projects, see 1 completed review');
  console.log('🏭 Company Dashboard: Buy credits from marketplace, view purchase history');
  
  console.log('\n🔄 Complete Flow Test:');
  console.log('1. Login as NGO → Submit new project');
  console.log('2. Login as Auditor → Approve project & allocate credits');  
  console.log('3. Login as NGO → List approved credits for sale');
  console.log('4. Login as Company → Purchase credits from marketplace');

  // Refresh the page to load the new data
  if (confirm('Demo data has been set up! Would you like to refresh the page to see the changes?')) {
    window.location.reload();
  }

} catch (error) {
  console.error('❌ Error setting up demo data:', error);
}
  
  // NGO test account address
  const ngoAddress = '0x24cF2631Cd812089e14da2Bb6d7A7C5505258656';
  
  // 1. Create some NGO projects
  const sampleProjects = [
    {
      id: '1703001001',
      title: 'Mangrove Restoration - Florida Bay',
      description: 'Large-scale mangrove restoration project covering 500 hectares in Florida Bay. The project aims to restore degraded coastal wetlands, enhance biodiversity, and sequester approximately 2,500 tons of CO2 over 10 years.',
      location: 'Florida Bay, United States',
      expectedCredits: 2500,
      status: 'pending',
      submittedDate: '2024-01-15'
    },
    {
      id: '1703001002', 
      title: 'Seagrass Conservation - Great Barrier Reef',
      description: 'Protection and restoration of seagrass meadows in the Great Barrier Reef Marine Park. This project focuses on establishing marine protected areas and implementing sustainable fishing practices.',
      location: 'Queensland, Australia', 
      expectedCredits: 1800,
      status: 'approved',
      submittedDate: '2024-01-10',
      allocatedCredits: 1750,
      auditNotes: 'Excellent project documentation. Verified carbon sequestration methodology approved.',
      auditDate: '2024-01-20'
    },
    {
      id: '1703001003',
      title: 'Salt Marsh Restoration - San Francisco Bay',
      description: 'Restoration of 300 hectares of salt marsh habitat in San Francisco Bay. Project includes native species replanting, invasive species removal, and installation of monitoring equipment.',
      location: 'San Francisco Bay, California, USA',
      expectedCredits: 1200,
      status: 'pending',
      submittedDate: '2024-01-22'
    }
  ];

  // Save NGO projects
  localStorage.setItem(`ngo_projects_${ngoAddress}`, JSON.stringify(sampleProjects));
  
  // 2. Set NGO allocated credits (from approved projects)
  localStorage.setItem(`ngo_credits_${ngoAddress}`, '1750');
  
  // 3. Create some marketplace offers (NGO selling credits)
  const marketplaceOffers = [
    {
      ngoAddress: ngoAddress,
      ngoName: 'Ocean Conservation NGO',
      credits: 500,
      pricePerCredit: 25.50,
      totalPrice: 500 * 25.50,
      timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
      ngoAddress: ngoAddress,
      ngoName: 'Ocean Conservation NGO', 
      credits: 300,
      pricePerCredit: 28.00,
      totalPrice: 300 * 28.00,
      timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    }
  ];
  
  localStorage.setItem('marketplace_offers', JSON.stringify(marketplaceOffers));
  
  // 4. Create some company purchases history
  const companyAddress = '0x8ba1f109551bD432803012645Hac136c82C5761';
  const companyPurchases = [
    {
      id: 'purchase_1703001001',
      offerId: 'offer_old_1',
      ngoName: 'Ocean Conservation NGO',
      credits: 200,
      totalPrice: 5100.00,
      purchaseDate: '2024-01-18',
      status: 'completed'
    }
  ];
  
  localStorage.setItem(`company_purchases_${companyAddress}`, JSON.stringify(companyPurchases));
  
  console.log('✅ Demo data setup complete!');
  console.log('📊 Created:');
  console.log(`  - ${sampleProjects.length} NGO projects (1 approved, 2 pending)`);
  console.log(`  - 1750 allocated credits for NGO`);
  console.log(`  - ${marketplaceOffers.length} marketplace offers`);  
  console.log(`  - ${companyPurchases.length} company purchase history`);
  console.log('\n🎭 Role-based flow to test:');
  console.log('1. Login as NGO → View projects, submit new project, manage credits for sale');
  console.log('2. Login as AUDITOR → Review pending projects, approve/reject with credit allocation');
  console.log('3. Login as COMPANY → Browse marketplace, purchase credits, view portfolio');
  
  // Refresh page to see changes
  window.location.reload();
};

// Auto-run setup
setupDemoData();