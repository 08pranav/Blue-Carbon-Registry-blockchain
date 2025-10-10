// Demo Data Setup Script
// Run this in the browser console at localhost:8082 to populate demo data

console.log('🌊 Setting up Blue Carbon Registry Demo Data...');

// NGO Test Account Address
const NGO_ADDRESS = '0x24cF2631Cd812089e14da2Bb6d7A7C5505258656';
const COMPANY_ADDRESS = '0x8ba1f109551bD432803012645Hac136c82C5761';

// Sample NGO Projects - All Indian Coastal Projects 🇮🇳
const sampleProjects = [
  {
    id: "1703001234567",
    title: "Mangrove Conservation in Mahim Creek",
    description: "Community-driven mangrove restoration project in Mahim Creek, Mumbai focusing on urban coastal biodiversity and carbon sequestration. This project aims to restore 200 hectares of degraded mangrove forest along Mumbai's coastline through local community involvement and scientific monitoring.",
    location: "Mahim Creek, Mumbai, Maharashtra, India",
    expectedCredits: 1750,
    status: "approved",
    submittedDate: "12/19/2024",
    allocatedCredits: 1750,
    auditNotes: "Excellent urban coastal restoration project with strong community participation. Methodology verified for Mumbai's tidal conditions. Approved for full credit allocation.",
    auditDate: "12/20/2024"
  },
  {
    id: "1703001234568", 
    title: "Seagrass Restoration - Alibaug Marine Sanctuary",
    description: "Protection and restoration of seagrass beds in Alibaug coastal waters near Mumbai. The project includes water quality monitoring, community awareness programs, and restoration of native seagrass species like Halophila ovalis to enhance marine carbon storage.",
    location: "Alibaug, Raigad District, Maharashtra, India",
    expectedCredits: 850,
    status: "pending",
    submittedDate: "12/21/2024"
  },
  {
    id: "1703001234569",
    title: "Coastal Wetland Restoration - Thane Creek",
    description: "Comprehensive wetland rehabilitation project in Thane Creek covering mangrove restoration, mudflat conservation, and sustainable fishing practices. Focus on enhancing blue carbon potential while supporting local fishing communities in the Mumbai Metropolitan Region.",
    location: "Thane Creek, Navi Mumbai, Maharashtra, India", 
    expectedCredits: 650,
    status: "pending",
    submittedDate: "12/22/2024"
  }
];

// Sample marketplace offers (credits for sale) - Prices in INR
const marketplaceOffers = [
  {
    ngoAddress: NGO_ADDRESS,
    ngoName: "Mumbai Coastal Conservation Society",
    credits: 500,
    pricePerCredit: 2125.50, // ₹2,125.50 per credit
    totalPrice: 500 * 2125.50,
    timestamp: new Date().toISOString()
  },
  {
    ngoAddress: NGO_ADDRESS,
    ngoName: "Mumbai Coastal Conservation Society", 
    credits: 250,
    pricePerCredit: 2340.00, // ₹2,340 per credit
    totalPrice: 250 * 2340.00,
    timestamp: new Date().toISOString()
  }
];

// Sample company purchases - Prices in INR
const companyPurchases = [
  {
    id: "purchase_1703001234570",
    offerId: "offer_1", 
    ngoName: "Mumbai Coastal Conservation Society",
    credits: 300,
    totalPrice: 637650, // ₹6,37,650 for 300 credits
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

  console.log('\n🎉 Demo data setup complete! 🇮🇳');
  console.log('\n📋 What you can now test:');
  console.log('👥 NGO Dashboard: View 3 Mumbai coastal projects (1 approved, 2 pending), see 1750 allocated credits');
  console.log('🔍 Auditor Dashboard: Review 2 pending projects (Alibaug & Thane Creek), see 1 completed review (Mahim Creek)');
  console.log('🏭 Company Dashboard: Buy credits from Mumbai Coastal Conservation Society, view purchase history');
  
  console.log('\n🔄 Complete Flow Test:');
  console.log('1. Login as NGO → Submit new Mumbai/Maharashtra coastal project');
  console.log('2. Login as Auditor → Approve project & allocate credits for verified blue carbon');  
  console.log('3. Login as NGO → List approved credits for sale on marketplace');
  console.log('4. Login as Company → Purchase credits from local NGOs in Mumbai region');

  // Refresh the page to load the new data
  if (confirm('Demo data has been set up! Would you like to refresh the page to see the changes?')) {
    window.location.reload();
  }

} catch (error) {
  console.error('❌ Error setting up demo data:', error);
}