export type KnownAsset = {
  name: string;
  symbol: string;
  type: "stock" | "mutual_fund" | "crypto" | "gold" | "other";
};

export const KNOWN_ASSETS: KnownAsset[] = [
  // Indices
  { name: "Nifty 50", symbol: "NIFTY", type: "other" },
  { name: "Bank Nifty", symbol: "BANKNIFTY", type: "other" },
  { name: "Fin Nifty", symbol: "FINNIFTY", type: "other" },
  { name: "Midcap Nifty", symbol: "MIDCPNIFTY", type: "other" },
  { name: "Sensex", symbol: "SENSEX", type: "other" },

  {
    "name": "Reliance Industries Ltd",
    "symbol": "RELIANCE.NS",
    "type": "stock"
  },
  {
    "name": "Tata Consultancy Services Ltd",
    "symbol": "TCS.NS",
    "type": "stock"
  },
  {
    "name": "HDFC Bank Ltd",
    "symbol": "HDFCBANK.NS",
    "type": "stock"
  },
  {
    "name": "Infosys Ltd",
    "symbol": "INFY.NS",
    "type": "stock"
  },
  {
    "name": "ICICI Bank Ltd",
    "symbol": "ICICIBANK.NS",
    "type": "stock"
  },
  {
    "name": "Hindustan Unilever Ltd",
    "symbol": "HINDUNILVR.NS",
    "type": "stock"
  },
  {
    "name": "State Bank of India",
    "symbol": "SBIN.NS",
    "type": "stock"
  },
  {
    "name": "Bharti Airtel Ltd",
    "symbol": "BHARTIARTL.NS",
    "type": "stock"
  },
  {
    "name": "ITC Ltd",
    "symbol": "ITC.NS",
    "type": "stock"
  },
  {
    "name": "Kotak Mahindra Bank Ltd",
    "symbol": "KOTAKBANK.NS",
    "type": "stock"
  },
  {
    "name": "Life Insurance Corporation of India",
    "symbol": "LICI.NS",
    "type": "stock"
  },
  {
    "name": "Larsen & Toubro Ltd",
    "symbol": "LT.NS",
    "type": "stock"
  },
  {
    "name": "HCL Technologies Ltd",
    "symbol": "HCLTECH.NS",
    "type": "stock"
  },
  {
    "name": "Axis Bank Ltd",
    "symbol": "AXISBANK.NS",
    "type": "stock"
  },
  {
    "name": "Bajaj Finance Ltd",
    "symbol": "BAJFINANCE.NS",
    "type": "stock"
  },
  {
    "name": "Sun Pharmaceutical Industries Ltd",
    "symbol": "SUNPHARMA.NS",
    "type": "stock"
  },
  {
    "name": "Wipro Ltd",
    "symbol": "WIPRO.NS",
    "type": "stock"
  },
  {
    "name": "Adani Enterprises Ltd",
    "symbol": "ADANIENT.NS",
    "type": "stock"
  },
  {
    "name": "Adani Ports and Special Economic Zone Ltd",
    "symbol": "ADANIPORTS.NS",
    "type": "stock"
  },
  {
    "name": "Maruti Suzuki India Ltd",
    "symbol": "MARUTI.NS",
    "type": "stock"
  },
  {
    "name": "Titan Company Ltd",
    "symbol": "TITAN.NS",
    "type": "stock"
  },
  {
    "name": "Asian Paints Ltd",
    "symbol": "ASIANPAINT.NS",
    "type": "stock"
  },
  {
    "name": "Mahindra & Mahindra Ltd",
    "symbol": "M&M.NS",
    "type": "stock"
  },
  {
    "name": "Nestle India Ltd",
    "symbol": "NESTLEIND.NS",
    "type": "stock"
  },
  {
    "name": "Tech Mahindra Ltd",
    "symbol": "TECHM.NS",
    "type": "stock"
  },
  {
    "name": "Ultratech Cement Ltd",
    "symbol": "ULTRACEMCO.NS",
    "type": "stock"
  },
  {
    "name": "Power Grid Corporation of India Ltd",
    "symbol": "POWERGRID.NS",
    "type": "stock"
  },
  {
    "name": "NTPC Ltd",
    "symbol": "NTPC.NS",
    "type": "stock"
  },
  {
    "name": "Oil & Natural Gas Corporation Ltd",
    "symbol": "ONGC.NS",
    "type": "stock"
  },
  {
    "name": "Bajaj Auto Ltd",
    "symbol": "BAJAJ-AUTO.NS",
    "type": "stock"
  },
  {
    "name": "Tata Motors Ltd",
    "symbol": "TATAMOTORS.NS",
    "type": "stock"
  },
  {
    "name": "Tata Steel Ltd",
    "symbol": "TATASTEEL.NS",
    "type": "stock"
  },
  {
    "name": "JSW Steel Ltd",
    "symbol": "JSWSTEEL.NS",
    "type": "stock"
  },
  {
    "name": "Hindalco Industries Ltd",
    "symbol": "HINDALCO.NS",
    "type": "stock"
  },
  {
    "name": "IndusInd Bank Ltd",
    "symbol": "INDUSINDBK.NS",
    "type": "stock"
  },
  {
    "name": "Adani Green Energy Ltd",
    "symbol": "ADANIGREEN.NS",
    "type": "stock"
  },
  {
    "name": "Adani Total Gas Ltd",
    "symbol": "ATGL.NS",
    "type": "stock"
  },
  {
    "name": "Adani Power Ltd",
    "symbol": "ADANIPOWER.NS",
    "type": "stock"
  },
  {
    "name": "Coal India Ltd",
    "symbol": "COALINDIA.NS",
    "type": "stock"
  },
  {
    "name": "Cipla Ltd",
    "symbol": "CIPLA.NS",
    "type": "stock"
  },
  {
    "name": "Dr. Reddy's Laboratories Ltd",
    "symbol": "DRREDDY.NS",
    "type": "stock"
  },
  {
    "name": "Divis Laboratories Ltd",
    "symbol": "DIVISLAB.NS",
    "type": "stock"
  },
  {
    "name": "Bajaj Finserv Ltd",
    "symbol": "BAJAJFINSV.NS",
    "type": "stock"
  },
  {
    "name": "HDFC Life Insurance Company Ltd",
    "symbol": "HDFCLIFE.NS",
    "type": "stock"
  },
  {
    "name": "SBI Life Insurance Company Ltd",
    "symbol": "SBILIFE.NS",
    "type": "stock"
  },
  {
    "name": "ICICI Prudential Life Insurance",
    "symbol": "ICICIPRULI.NS",
    "type": "stock"
  },
  {
    "name": "Eicher Motors Ltd",
    "symbol": "EICHERMOT.NS",
    "type": "stock"
  },
  {
    "name": "Hero MotoCorp Ltd",
    "symbol": "HEROMOTOCO.NS",
    "type": "stock"
  },
  {
    "name": "Grasim Industries Ltd",
    "symbol": "GRASIM.NS",
    "type": "stock"
  },
  {
    "name": "UPL Ltd",
    "symbol": "UPL.NS",
    "type": "stock"
  },
  {
    "name": "Shree Cement Ltd",
    "symbol": "SHREECEM.NS",
    "type": "stock"
  },
  {
    "name": "Apollo Hospitals Enterprise Ltd",
    "symbol": "APOLLOHOSP.NS",
    "type": "stock"
  },
  {
    "name": "Pidilite Industries Ltd",
    "symbol": "PIDILITIND.NS",
    "type": "stock"
  },
  {
    "name": "Muthoot Finance Ltd",
    "symbol": "MUTHOOTFIN.NS",
    "type": "stock"
  },
  {
    "name": "Godrej Consumer Products Ltd",
    "symbol": "GODREJCP.NS",
    "type": "stock"
  },
  {
    "name": "Havells India Ltd",
    "symbol": "HAVELLS.NS",
    "type": "stock"
  },
  {
    "name": "Siemens Ltd",
    "symbol": "SIEMENS.NS",
    "type": "stock"
  },
  {
    "name": "ABB India Ltd",
    "symbol": "ABB.NS",
    "type": "stock"
  },
  {
    "name": "Dabur India Ltd",
    "symbol": "DABUR.NS",
    "type": "stock"
  },
  {
    "name": "Marico Ltd",
    "symbol": "MARICO.NS",
    "type": "stock"
  },
  {
    "name": "Colgate-Palmolive (India) Ltd",
    "symbol": "COLPAL.NS",
    "type": "stock"
  },
  {
    "name": "Interglobe Aviation Ltd (IndiGo)",
    "symbol": "INDIGO.NS",
    "type": "stock"
  },
  {
    "name": "SpiceJet Ltd",
    "symbol": "SPICEJET.NS",
    "type": "stock"
  },
  {
    "name": "Zomato Ltd",
    "symbol": "ZOMATO.NS",
    "type": "stock"
  },
  {
    "name": "Nykaa (FSN E-Commerce Ventures)",
    "symbol": "NYKAA.NS",
    "type": "stock"
  },
  {
    "name": "Paytm (One 97 Communications)",
    "symbol": "PAYTM.NS",
    "type": "stock"
  },
  {
    "name": "PB Fintech (PolicyBazaar)",
    "symbol": "POLICYBZR.NS",
    "type": "stock"
  },
  {
    "name": "Delhivery Ltd",
    "symbol": "DELHIVERY.NS",
    "type": "stock"
  },
  {
    "name": "Cartrade Tech Ltd",
    "symbol": "CARTRADE.NS",
    "type": "stock"
  },
  {
    "name": "Sona BLW Precision Forgings Ltd",
    "symbol": "SONACOMS.NS",
    "type": "stock"
  },
  {
    "name": "Ami Organics Ltd",
    "symbol": "AMIORG.NS",
    "type": "stock"
  },
  {
    "name": "Clean Science and Technology Ltd",
    "symbol": "CLEAN.NS",
    "type": "stock"
  },
  {
    "name": "Laxmi Organic Industries Ltd",
    "symbol": "LXCHEM.NS",
    "type": "stock"
  },
  {
    "name": "Devyani International Ltd",
    "symbol": "DEVYANI.NS",
    "type": "stock"
  },
  {
    "name": "Sapphire Foods India Ltd",
    "symbol": "SAPPHIRE.NS",
    "type": "stock"
  },
  {
    "name": "Burger King India Ltd",
    "symbol": "BURGERKING.NS",
    "type": "stock"
  },
  {
    "name": "Restaurant Brands Asia Ltd",
    "symbol": "RBA.NS",
    "type": "stock"
  },
  {
    "name": "Vedanta Ltd",
    "symbol": "VEDL.NS",
    "type": "stock"
  },
  {
    "name": "Sterlite Technologies Ltd",
    "symbol": "STLTECH.NS",
    "type": "stock"
  },
  {
    "name": "Tata Communications Ltd",
    "symbol": "TATACOMM.NS",
    "type": "stock"
  },
  {
    "name": "Mphasis Ltd",
    "symbol": "MPHASIS.NS",
    "type": "stock"
  },
  {
    "name": "L&T Infotech (LTIMindtree)",
    "symbol": "LTIM.NS",
    "type": "stock"
  },
  {
    "name": "Mindtree Ltd",
    "symbol": "MINDTREE.NS",
    "type": "stock"
  },
  {
    "name": "Coforge Ltd",
    "symbol": "COFORGE.NS",
    "type": "stock"
  },
  {
    "name": "Persistent Systems Ltd",
    "symbol": "PERSISTENT.NS",
    "type": "stock"
  },
  {
    "name": "Zensar Technologies Ltd",
    "symbol": "ZENSARTECH.NS",
    "type": "stock"
  },
  {
    "name": "Hexaware Technologies Ltd",
    "symbol": "HEXAWARE.NS",
    "type": "stock"
  },
  {
    "name": "Mastech Digital Ltd",
    "symbol": "MASTECH.NS",
    "type": "stock"
  },
  {
    "name": "Firstsource Solutions Ltd",
    "symbol": "FSL.NS",
    "type": "stock"
  },
  {
    "name": "KPIT Technologies Ltd",
    "symbol": "KPITTECH.NS",
    "type": "stock"
  },
  {
    "name": "Tata Elxsi Ltd",
    "symbol": "TATAELXSI.NS",
    "type": "stock"
  },
  {
    "name": "NIIT Technologies Ltd",
    "symbol": "NIITTECH.NS",
    "type": "stock"
  },
  {
    "name": "Birlasoft Ltd",
    "symbol": "BSOFT.NS",
    "type": "stock"
  },
  {
    "name": "Cyient Ltd",
    "symbol": "CYIENT.NS",
    "type": "stock"
  },
  {
    "name": "Sonata Software Ltd",
    "symbol": "SONATSOFTW.NS",
    "type": "stock"
  },
  {
    "name": "Eclerx Services Ltd",
    "symbol": "ECLERX.NS",
    "type": "stock"
  },
  {
    "name": "Sasken Technologies Ltd",
    "symbol": "SASKEN.NS",
    "type": "stock"
  },
  {
    "name": "Ramsons Projects Ltd",
    "symbol": "RAMSONS.NS",
    "type": "stock"
  },
  {
    "name": "Tanla Platforms Ltd",
    "symbol": "TANLA.NS",
    "type": "stock"
  },
  {
    "name": "Indiamart Intermesh Ltd",
    "symbol": "INDIAMART.NS",
    "type": "stock"
  },
  {
    "name": "Just Dial Ltd",
    "symbol": "JUSTDIAL.NS",
    "type": "stock"
  },
  {
    "name": "Info Edge (India) Ltd",
    "symbol": "NAUKRI.NS",
    "type": "stock"
  },
  {
    "name": "Matrimony.com Ltd",
    "symbol": "MATRIMONY.NS",
    "type": "stock"
  },
  {
    "name": "IRCTC (Indian Railway Catering)",
    "symbol": "IRCTC.NS",
    "type": "stock"
  },
  {
    "name": "Container Corporation of India",
    "symbol": "CONCOR.NS",
    "type": "stock"
  },
  {
    "name": "Adani Wilmar Ltd",
    "symbol": "AWL.NS",
    "type": "stock"
  },
  {
    "name": "Varun Beverages Ltd",
    "symbol": "VBL.NS",
    "type": "stock"
  },
  {
    "name": "Tata Consumer Products Ltd",
    "symbol": "TATACONSUM.NS",
    "type": "stock"
  },
  {
    "name": "Emami Ltd",
    "symbol": "EMAMILTD.NS",
    "type": "stock"
  },
  {
    "name": "Godrej Industries Ltd",
    "symbol": "GODREJIND.NS",
    "type": "stock"
  },
  {
    "name": "Godrej Properties Ltd",
    "symbol": "GODREJPROP.NS",
    "type": "stock"
  },
  {
    "name": "Prestige Estates Projects Ltd",
    "symbol": "PRESTIGE.NS",
    "type": "stock"
  },
  {
    "name": "Oberoi Realty Ltd",
    "symbol": "OBEROIRLTY.NS",
    "type": "stock"
  },
  {
    "name": "DLF Ltd",
    "symbol": "DLF.NS",
    "type": "stock"
  },
  {
    "name": "Macrotech Developers Ltd (Lodha)",
    "symbol": "LODHA.NS",
    "type": "stock"
  },
  {
    "name": "Sunteck Realty Ltd",
    "symbol": "SUNTECK.NS",
    "type": "stock"
  },
  {
    "name": "Brigade Enterprises Ltd",
    "symbol": "BRIGADE.NS",
    "type": "stock"
  },
  {
    "name": "Sobha Ltd",
    "symbol": "SOBHA.NS",
    "type": "stock"
  },
  {
    "name": "Puravankara Ltd",
    "symbol": "PURVA.NS",
    "type": "stock"
  },
  {
    "name": "Mahindra Lifespace Developers Ltd",
    "symbol": "MAHLIFE.NS",
    "type": "stock"
  },
  {
    "name": "Kolte-Patil Developers Ltd",
    "symbol": "KOLTEPATIL.NS",
    "type": "stock"
  },
  {
    "name": "Arvind SmartSpaces Ltd",
    "symbol": "ARVSF.NS",
    "type": "stock"
  },
  {
    "name": "Indiabulls Real Estate Ltd",
    "symbol": "IBREALEST.NS",
    "type": "stock"
  },
  {
    "name": "HDFC Ltd",
    "symbol": "HDFC.NS",
    "type": "stock"
  },
  {
    "name": "LIC Housing Finance Ltd",
    "symbol": "LICHSGFIN.NS",
    "type": "stock"
  },
  {
    "name": "Can Fin Homes Ltd",
    "symbol": "CANFINHOME.NS",
    "type": "stock"
  },
  {
    "name": "Home First Finance Company",
    "symbol": "HOMEFIRST.NS",
    "type": "stock"
  },
  {
    "name": "Aptus Value Housing Finance",
    "symbol": "APTUS.NS",
    "type": "stock"
  },
  {
    "name": "Aavas Financiers Ltd",
    "symbol": "AAVAS.NS",
    "type": "stock"
  },
  {
    "name": "India Shelter Finance Corporation",
    "symbol": "INDIASHLTR.NS",
    "type": "stock"
  },
  {
    "name": "Repco Home Finance Ltd",
    "symbol": "REPCOHOME.NS",
    "type": "stock"
  },
  {
    "name": "GIC Housing Finance Ltd",
    "symbol": "GICHSGFIN.NS",
    "type": "stock"
  },
  {
    "name": "PNB Housing Finance Ltd",
    "symbol": "PNBHOUSING.NS",
    "type": "stock"
  },
  {
    "name": "Shriram Finance Ltd",
    "symbol": "SHRIRAMFIN.NS",
    "type": "stock"
  },
  {
    "name": "Cholamandalam Investment",
    "symbol": "CHOLAFIN.NS",
    "type": "stock"
  },
  {
    "name": "Mahindra & Mahindra Financial Services",
    "symbol": "M&MFIN.NS",
    "type": "stock"
  },
  {
    "name": "Manappuram Finance Ltd",
    "symbol": "MANAPPURAM.NS",
    "type": "stock"
  },
  {
    "name": "IIFL Finance Ltd",
    "symbol": "IIFL.NS",
    "type": "stock"
  },
  {
    "name": "Five Star Business Finance Ltd",
    "symbol": "FIVESTAR.NS",
    "type": "stock"
  },
  {
    "name": "Ugro Capital Ltd",
    "symbol": "UGROCAP.NS",
    "type": "stock"
  },
  {
    "name": "Spandana Sphoorty Financial Ltd",
    "symbol": "SPANDANA.NS",
    "type": "stock"
  },
  {
    "name": "Credit Access Grameen Ltd",
    "symbol": "CREDITACC.NS",
    "type": "stock"
  },
  {
    "name": "Equitas Small Finance Bank",
    "symbol": "EQUITASBNK.NS",
    "type": "stock"
  },
  {
    "name": "AU Small Finance Bank Ltd",
    "symbol": "AUBANK.NS",
    "type": "stock"
  },
  {
    "name": "Ujjivan Small Finance Bank",
    "symbol": "UJJIVANSFB.NS",
    "type": "stock"
  },
  {
    "name": "Jana Small Finance Bank Ltd",
    "symbol": "JANA.NS",
    "type": "stock"
  },
  {
    "name": "Suryoday Small Finance Bank",
    "symbol": "SURYODAY.NS",
    "type": "stock"
  },
  {
    "name": "ESAF Small Finance Bank Ltd",
    "symbol": "ESAFSFB.NS",
    "type": "stock"
  },
  {
    "name": "Utkarsh Small Finance Bank",
    "symbol": "UTKARSH.NS",
    "type": "stock"
  },
  {
    "name": "Bandhan Bank Ltd",
    "symbol": "BANDHANBNK.NS",
    "type": "stock"
  },
  {
    "name": "DCB Bank Ltd",
    "symbol": "DCBBANK.NS",
    "type": "stock"
  },
  {
    "name": "Federal Bank Ltd",
    "symbol": "FEDERALBNK.NS",
    "type": "stock"
  },
  {
    "name": "Karnataka Bank Ltd",
    "symbol": "KTKBANK.NS",
    "type": "stock"
  },
  {
    "name": "South Indian Bank Ltd",
    "symbol": "SOUTHBANK.NS",
    "type": "stock"
  },
  {
    "name": "Karur Vysya Bank Ltd",
    "symbol": "KARURVYSYA.NS",
    "type": "stock"
  },
  {
    "name": "City Union Bank Ltd",
    "symbol": "CUB.NS",
    "type": "stock"
  },
  {
    "name": "Lakshmi Vilas Bank Ltd",
    "symbol": "LVBANK.NS",
    "type": "stock"
  },
  {
    "name": "RBL Bank Ltd",
    "symbol": "RBLBANK.NS",
    "type": "stock"
  },
  {
    "name": "Yes Bank Ltd",
    "symbol": "YESBANK.NS",
    "type": "stock"
  },
  {
    "name": "IDBI Bank Ltd",
    "symbol": "IDBI.NS",
    "type": "stock"
  },
  {
    "name": "Bank of Baroda",
    "symbol": "BANKBARODA.NS",
    "type": "stock"
  },
  {
    "name": "Punjab National Bank",
    "symbol": "PNB.NS",
    "type": "stock"
  },
  {
    "name": "Canara Bank",
    "symbol": "CANBK.NS",
    "type": "stock"
  },
  {
    "name": "Bank of India",
    "symbol": "BANKINDIA.NS",
    "type": "stock"
  },
  {
    "name": "Union Bank of India",
    "symbol": "UNIONBANK.NS",
    "type": "stock"
  },
  {
    "name": "Indian Bank",
    "symbol": "INDIANB.NS",
    "type": "stock"
  },
  {
    "name": "Central Bank of India",
    "symbol": "CENTRALBK.NS",
    "type": "stock"
  },
  {
    "name": "UCO Bank",
    "symbol": "UCOBANK.NS",
    "type": "stock"
  },
  {
    "name": "Bank of Maharashtra",
    "symbol": "MAHABANK.NS",
    "type": "stock"
  },
  {
    "name": "Indian Overseas Bank",
    "symbol": "IOB.NS",
    "type": "stock"
  },
  {
    "name": "Punjab & Sind Bank",
    "symbol": "PSB.NS",
    "type": "stock"
  },
  {
    "name": "Nuvoco Vistas Corporation Ltd",
    "symbol": "NUVOCO.NS",
    "type": "stock"
  },
  {
    "name": "ACC Ltd",
    "symbol": "ACC.NS",
    "type": "stock"
  },
  {
    "name": "Ambuja Cements Ltd",
    "symbol": "AMBUJACEM.NS",
    "type": "stock"
  },
  {
    "name": "Dalmia Bharat Ltd",
    "symbol": "DALBHARAT.NS",
    "type": "stock"
  },
  {
    "name": "JK Cement Ltd",
    "symbol": "JKCEMENT.NS",
    "type": "stock"
  },
  {
    "name": "Orient Cement Ltd",
    "symbol": "ORIENTCEM.NS",
    "type": "stock"
  },
  {
    "name": "Heidelbergcement India Ltd",
    "symbol": "HEIDELBERG.NS",
    "type": "stock"
  },
  {
    "name": "Birla Corporation Ltd",
    "symbol": "BIRLACORPN.NS",
    "type": "stock"
  },
  {
    "name": "India Cements Ltd",
    "symbol": "INDIACEM.NS",
    "type": "stock"
  },
  {
    "name": "Ramco Cements Ltd",
    "symbol": "RAMCOCEM.NS",
    "type": "stock"
  },
  {
    "name": "Steel Authority of India Ltd",
    "symbol": "SAIL.NS",
    "type": "stock"
  },
  {
    "name": "Jindal Steel and Power Ltd",
    "symbol": "JINDALSTEL.NS",
    "type": "stock"
  },
  {
    "name": "Welspun Corp Ltd",
    "symbol": "WELCORP.NS",
    "type": "stock"
  },
  {
    "name": "Essar Steel India Ltd",
    "symbol": "ESSAR.NS",
    "type": "stock"
  },
  {
    "name": "Bhushan Steel Ltd",
    "symbol": "BHUSANSTL.NS",
    "type": "stock"
  },
  {
    "name": "Mukand Ltd",
    "symbol": "MUKANDLTD.NS",
    "type": "stock"
  },
  {
    "name": "Mahindra CIE Automotive Ltd",
    "symbol": "MAHINDCIE.NS",
    "type": "stock"
  },
  {
    "name": "Endurance Technologies Ltd",
    "symbol": "ENDURANCE.NS",
    "type": "stock"
  },
  {
    "name": "Minda Industries Ltd",
    "symbol": "MINDAIND.NS",
    "type": "stock"
  },
  {
    "name": "Motherson Sumi Systems Ltd",
    "symbol": "MOTHERSUMI.NS",
    "type": "stock"
  },
  {
    "name": "Bharat Forge Ltd",
    "symbol": "BHARATFORG.NS",
    "type": "stock"
  },
  {
    "name": "Schaeffler India Ltd",
    "symbol": "SCHAEFFLER.NS",
    "type": "stock"
  },
  {
    "name": "SKF India Ltd",
    "symbol": "SKFINDIA.NS",
    "type": "stock"
  },
  {
    "name": "Timken India Ltd",
    "symbol": "TIMKEN.NS",
    "type": "stock"
  },
  {
    "name": "Exide Industries Ltd",
    "symbol": "EXIDEIND.NS",
    "type": "stock"
  },
  {
    "name": "Amara Raja Batteries Ltd",
    "symbol": "AMARAJABAT.NS",
    "type": "stock"
  },
  {
    "name": "MRF Ltd",
    "symbol": "MRF.NS",
    "type": "stock"
  },
  {
    "name": "Apollo Tyres Ltd",
    "symbol": "APOLLOTYRE.NS",
    "type": "stock"
  },
  {
    "name": "CEAT Ltd",
    "symbol": "CEATLTD.NS",
    "type": "stock"
  },
  {
    "name": "JK Tyre & Industries Ltd",
    "symbol": "JKTYRE.NS",
    "type": "stock"
  },
  {
    "name": "Balkrishna Industries Ltd",
    "symbol": "BALKRISIND.NS",
    "type": "stock"
  },
  {
    "name": "Gujarat Fluorochemicals Ltd",
    "symbol": "FLUOROCHEM.NS",
    "type": "stock"
  },
  {
    "name": "Navin Fluorine International Ltd",
    "symbol": "NAVINFLUOR.NS",
    "type": "stock"
  },
  {
    "name": "SRF Ltd",
    "symbol": "SRF.NS",
    "type": "stock"
  },
  {
    "name": "PI Industries Ltd",
    "symbol": "PIIND.NS",
    "type": "stock"
  },
  {
    "name": "Rallis India Ltd",
    "symbol": "RALLIS.NS",
    "type": "stock"
  },
  {
    "name": "Bayer Cropscience Ltd",
    "symbol": "BAYERCROP.NS",
    "type": "stock"
  },
  {
    "name": "Dhanuka Agritech Ltd",
    "symbol": "DHANUKA.NS",
    "type": "stock"
  },
  {
    "name": "Coromandel International Ltd",
    "symbol": "COROMANDEL.NS",
    "type": "stock"
  },
  {
    "name": "Chambal Fertilizers & Chemicals",
    "symbol": "CHAMBLFERT.NS",
    "type": "stock"
  },
  {
    "name": "GSFC (Gujarat State Fertilizers)",
    "symbol": "GSFC.NS",
    "type": "stock"
  },
  {
    "name": "National Fertilizers Ltd",
    "symbol": "NFL.NS",
    "type": "stock"
  },
  {
    "name": "Rashtriya Chemicals & Fertilizers",
    "symbol": "RCF.NS",
    "type": "stock"
  },
  {
    "name": "Deepak Nitrite Ltd",
    "symbol": "DEEPAKNTR.NS",
    "type": "stock"
  },
  {
    "name": "Aarti Industries Ltd",
    "symbol": "AARTIIND.NS",
    "type": "stock"
  },
  {
    "name": "Jubilant Ingrevia Ltd",
    "symbol": "JUBLINGREA.NS",
    "type": "stock"
  },
  {
    "name": "Vinati Organics Ltd",
    "symbol": "VINATIORGA.NS",
    "type": "stock"
  },
  {
    "name": "Sudarshan Chemical Industries",
    "symbol": "SUDARSCHEM.NS",
    "type": "stock"
  },
  {
    "name": "Kansai Nerolac Paints Ltd",
    "symbol": "KANSAINER.NS",
    "type": "stock"
  },
  {
    "name": "Berger Paints India Ltd",
    "symbol": "BERGEPAINT.NS",
    "type": "stock"
  },
  {
    "name": "Akzo Nobel India Ltd",
    "symbol": "AKZOINDIA.NS",
    "type": "stock"
  },
  {
    "name": "Shalimar Paints Ltd",
    "symbol": "SHALPAINTS.NS",
    "type": "stock"
  },
  {
    "name": "Jyothy Labs Ltd",
    "symbol": "JYOTHYLAB.NS",
    "type": "stock"
  },
  {
    "name": "Godrej Agrovet Ltd",
    "symbol": "GODREJAGRO.NS",
    "type": "stock"
  },
  {
    "name": "Tata Chemicals Ltd",
    "symbol": "TATACHEM.NS",
    "type": "stock"
  },
  {
    "name": "GHCL Ltd",
    "symbol": "GHCL.NS",
    "type": "stock"
  },
  {
    "name": "Nirma Ltd",
    "symbol": "NRMA.NS",
    "type": "stock"
  },
  {
    "name": "Finolex Industries Ltd",
    "symbol": "FINOLEXIND.NS",
    "type": "stock"
  },
  {
    "name": "Supreme Industries Ltd",
    "symbol": "SUPREMEIND.NS",
    "type": "stock"
  },
  {
    "name": "Astral Ltd",
    "symbol": "ASTRAL.NS",
    "type": "stock"
  },
  {
    "name": "Prince Pipes and Fittings Ltd",
    "symbol": "PRINCEPIPE.NS",
    "type": "stock"
  },
  {
    "name": "Skipper Ltd",
    "symbol": "SKIPPER.NS",
    "type": "stock"
  },
  {
    "name": "Cera Sanitaryware Ltd",
    "symbol": "CERA.NS",
    "type": "stock"
  },
  {
    "name": "Kajaria Ceramics Ltd",
    "symbol": "KAJARIACER.NS",
    "type": "stock"
  },
  {
    "name": "Somany Ceramics Ltd",
    "symbol": "SOMANYCERA.NS",
    "type": "stock"
  },
  {
    "name": "Orient Bell Ltd",
    "symbol": "ORIENTBELL.NS",
    "type": "stock"
  },
  {
    "name": "Greenpanel Industries Ltd",
    "symbol": "GREENPANEL.NS",
    "type": "stock"
  },
  {
    "name": "Century Plyboards (India) Ltd",
    "symbol": "CENTURYPLY.NS",
    "type": "stock"
  },
  {
    "name": "Greenply Industries Ltd",
    "symbol": "GREENPLY.NS",
    "type": "stock"
  },
  {
    "name": "Archidply Industries Ltd",
    "symbol": "ARCHIDPLY.NS",
    "type": "stock"
  },
  {
    "name": "Styrenix Performance Materials",
    "symbol": "STYRENIX.NS",
    "type": "stock"
  },
  {
    "name": "BASF India Ltd",
    "symbol": "BASF.NS",
    "type": "stock"
  },
  {
    "name": "Bata India Ltd",
    "symbol": "BATAINDIA.NS",
    "type": "stock"
  },
  {
    "name": "Relaxo Footwears Ltd",
    "symbol": "RELAXO.NS",
    "type": "stock"
  },
  {
    "name": "Campus Activewear Ltd",
    "symbol": "CAMPUS.NS",
    "type": "stock"
  },
  {
    "name": "Liberty Shoes Ltd",
    "symbol": "LIBERTSHOE.NS",
    "type": "stock"
  },
  {
    "name": "Page Industries Ltd",
    "symbol": "PAGEIND.NS",
    "type": "stock"
  },
  {
    "name": "Arvind Ltd",
    "symbol": "ARVIND.NS",
    "type": "stock"
  },
  {
    "name": "Raymond Ltd",
    "symbol": "RAYMOND.NS",
    "type": "stock"
  },
  {
    "name": "Vardhman Textiles Ltd",
    "symbol": "VTL.NS",
    "type": "stock"
  },
  {
    "name": "Welspun India Ltd",
    "symbol": "WELSPUNIND.NS",
    "type": "stock"
  },
  {
    "name": "Trident Ltd",
    "symbol": "TRIDENT.NS",
    "type": "stock"
  },
  {
    "name": "Himatsingka Seide Ltd",
    "symbol": "HIMATSEIDE.NS",
    "type": "stock"
  },
  {
    "name": "Bombay Dyeing & Mfg Co Ltd",
    "symbol": "BOMBAYDYNG.NS",
    "type": "stock"
  },
  {
    "name": "Mafatlal Industries Ltd",
    "symbol": "MAFATIND.NS",
    "type": "stock"
  },
  {
    "name": "S. Kumars Nationwide Ltd",
    "symbol": "SKUMARSYNT.NS",
    "type": "stock"
  },
  {
    "name": "TCNS Clothing Co Ltd",
    "symbol": "TCNSBRANDS.NS",
    "type": "stock"
  },
  {
    "name": "Trent Ltd",
    "symbol": "TRENT.NS",
    "type": "stock"
  },
  {
    "name": "Aditya Birla Fashion & Retail",
    "symbol": "ABFRL.NS",
    "type": "stock"
  },
  {
    "name": "Shoppers Stop Ltd",
    "symbol": "SHOPERSTOP.NS",
    "type": "stock"
  },
  {
    "name": "V-Mart Retail Ltd",
    "symbol": "VMART.NS",
    "type": "stock"
  },
  {
    "name": "Avenue Supermarts Ltd (DMart)",
    "symbol": "DMART.NS",
    "type": "stock"
  },
  {
    "name": "Future Retail Ltd",
    "symbol": "FRETAIL.NS",
    "type": "stock"
  },
  {
    "name": "Spencer's Retail Ltd",
    "symbol": "SPENCERS.NS",
    "type": "stock"
  },
  {
    "name": "Hindustan Foods Ltd",
    "symbol": "HNDFDS.NS",
    "type": "stock"
  },
  {
    "name": "Bikaji Foods International Ltd",
    "symbol": "BIKAJI.NS",
    "type": "stock"
  },
  {
    "name": "Prataap Snacks Ltd",
    "symbol": "DIAMONDYD.NS",
    "type": "stock"
  },
  {
    "name": "DFM Foods Ltd",
    "symbol": "DFMFOODS.NS",
    "type": "stock"
  },
  {
    "name": "Capital Foods Ltd",
    "symbol": "CAPFOOD.NS",
    "type": "stock"
  },
  {
    "name": "KRBL Ltd",
    "symbol": "KRBL.NS",
    "type": "stock"
  },
  {
    "name": "LT Foods Ltd",
    "symbol": "LTFOODS.NS",
    "type": "stock"
  },
  {
    "name": "Kohinoor Foods Ltd",
    "symbol": "KOHINOOR.NS",
    "type": "stock"
  },
  {
    "name": "Heritage Foods Ltd",
    "symbol": "HERITGFOOD.NS",
    "type": "stock"
  },
  {
    "name": "Prabhat Dairy Ltd",
    "symbol": "PRABHAT.NS",
    "type": "stock"
  },
  {
    "name": "Hatsun Agro Product Ltd",
    "symbol": "HATSUN.NS",
    "type": "stock"
  },
  {
    "name": "Parag Milk Foods Ltd",
    "symbol": "PARAGMILK.NS",
    "type": "stock"
  },
  {
    "name": "Dodla Dairy Ltd",
    "symbol": "DODLA.NS",
    "type": "stock"
  },
  {
    "name": "Milk Mantra Dairy Ltd",
    "symbol": "MILKMANTRA.NS",
    "type": "stock"
  },
  {
    "name": "Venky's (India) Ltd",
    "symbol": "VENKYS.NS",
    "type": "stock"
  },
  {
    "name": "Suguna Foods Ltd",
    "symbol": "SUGUNA.NS",
    "type": "stock"
  },
  {
    "name": "Zydus Lifesciences Ltd",
    "symbol": "ZYDUSLIFE.NS",
    "type": "stock"
  },
  {
    "name": "Torrent Pharmaceuticals Ltd",
    "symbol": "TORNTPHARM.NS",
    "type": "stock"
  },
  {
    "name": "Aurobindo Pharma Ltd",
    "symbol": "AUROPHARMA.NS",
    "type": "stock"
  },
  {
    "name": "Lupin Ltd",
    "symbol": "LUPIN.NS",
    "type": "stock"
  },
  {
    "name": "Cadila Healthcare Ltd",
    "symbol": "CADILAHC.NS",
    "type": "stock"
  },
  {
    "name": "Glenmark Pharmaceuticals Ltd",
    "symbol": "GLENMARK.NS",
    "type": "stock"
  },
  {
    "name": "Ipca Laboratories Ltd",
    "symbol": "IPCALAB.NS",
    "type": "stock"
  },
  {
    "name": "Alkem Laboratories Ltd",
    "symbol": "ALKEM.NS",
    "type": "stock"
  },
  {
    "name": "Abbott India Ltd",
    "symbol": "ABBOTINDIA.NS",
    "type": "stock"
  },
  {
    "name": "Pfizer Ltd",
    "symbol": "PFIZER.NS",
    "type": "stock"
  },
  {
    "name": "GlaxoSmithKline Pharma Ltd",
    "symbol": "GLAXO.NS",
    "type": "stock"
  },
  {
    "name": "Sanofi India Ltd",
    "symbol": "SANOFI.NS",
    "type": "stock"
  },
  {
    "name": "Merck Ltd",
    "symbol": "MERCK.NS",
    "type": "stock"
  },
  {
    "name": "Novartis India Ltd",
    "symbol": "NOVARTIND.NS",
    "type": "stock"
  },
  {
    "name": "Natco Pharma Ltd",
    "symbol": "NATCOPHARM.NS",
    "type": "stock"
  },
  {
    "name": "Granules India Ltd",
    "symbol": "GRANULES.NS",
    "type": "stock"
  },
  {
    "name": "Laurus Labs Ltd",
    "symbol": "LAURUSLABS.NS",
    "type": "stock"
  },
  {
    "name": "Biocon Ltd",
    "symbol": "BIOCON.NS",
    "type": "stock"
  },
  {
    "name": "Strides Pharma Science Ltd",
    "symbol": "STAR.NS",
    "type": "stock"
  },
  {
    "name": "Bliss GVS Pharma Ltd",
    "symbol": "BLISSGVS.NS",
    "type": "stock"
  },
  {
    "name": "FDC Ltd",
    "symbol": "FDC.NS",
    "type": "stock"
  },
  {
    "name": "JB Chemicals & Pharmaceuticals Ltd",
    "symbol": "JBCHEPHARM.NS",
    "type": "stock"
  },
  {
    "name": "Mankind Pharma Ltd",
    "symbol": "MANKIND.NS",
    "type": "stock"
  },
  {
    "name": "Eris Lifesciences Ltd",
    "symbol": "ERIS.NS",
    "type": "stock"
  },
  {
    "name": "Procter & Gamble Hygiene & Health",
    "symbol": "PGHH.NS",
    "type": "stock"
  },
  {
    "name": "Gillette India Ltd",
    "symbol": "GILLETTE.NS",
    "type": "stock"
  },
  {
    "name": "3M India Ltd",
    "symbol": "3MINDIA.NS",
    "type": "stock"
  },
  {
    "name": "Honeywell Automation India Ltd",
    "symbol": "HONAUT.NS",
    "type": "stock"
  },
  {
    "name": "Whirlpool of India Ltd",
    "symbol": "WHIRLPOOL.NS",
    "type": "stock"
  },
  {
    "name": "Blue Star Ltd",
    "symbol": "BLUESTAR.NS",
    "type": "stock"
  },
  {
    "name": "Voltas Ltd",
    "symbol": "VOLTAS.NS",
    "type": "stock"
  },
  {
    "name": "Hitachi Energy India Ltd",
    "symbol": "POWERINDIA.NS",
    "type": "stock"
  },
  {
    "name": "Crompton Greaves Consumer Electricals",
    "symbol": "CROMPTON.NS",
    "type": "stock"
  },
  {
    "name": "Orient Electric Ltd",
    "symbol": "ORIENTELEC.NS",
    "type": "stock"
  },
  {
    "name": "Bajaj Electricals Ltd",
    "symbol": "BAJAJELEC.NS",
    "type": "stock"
  },
  {
    "name": "V-Guard Industries Ltd",
    "symbol": "VGUARD.NS",
    "type": "stock"
  },
  {
    "name": "Finolex Cables Ltd",
    "symbol": "FINCABLES.NS",
    "type": "stock"
  },
  {
    "name": "Polycab India Ltd",
    "symbol": "POLYCAB.NS",
    "type": "stock"
  },
  {
    "name": "KEI Industries Ltd",
    "symbol": "KEI.NS",
    "type": "stock"
  },
  {
    "name": "Sterlite Power Transmission Ltd",
    "symbol": "STRTECH.NS",
    "type": "stock"
  },
  {
    "name": "Bharat Heavy Electricals Ltd",
    "symbol": "BHEL.NS",
    "type": "stock"
  },
  {
    "name": "Bharat Electronics Ltd",
    "symbol": "BEL.NS",
    "type": "stock"
  },
  {
    "name": "HAL (Hindustan Aeronautics Ltd)",
    "symbol": "HAL.NS",
    "type": "stock"
  },
  {
    "name": "BEML Ltd",
    "symbol": "BEML.NS",
    "type": "stock"
  },
  {
    "name": "Garden Reach Shipbuilders & Eng",
    "symbol": "GRSE.NS",
    "type": "stock"
  },
  {
    "name": "Cochin Shipyard Ltd",
    "symbol": "COCHINSHIP.NS",
    "type": "stock"
  },
  {
    "name": "Mazagon Dock Shipbuilders Ltd",
    "symbol": "MAZDOCK.NS",
    "type": "stock"
  },
  {
    "name": "Goa Shipyard Ltd",
    "symbol": "GOASHIP.NS",
    "type": "stock"
  },
  {
    "name": "Bharat Dynamics Ltd",
    "symbol": "BDL.NS",
    "type": "stock"
  },
  {
    "name": "Data Patterns (India) Ltd",
    "symbol": "DATAPATTNS.NS",
    "type": "stock"
  },
  {
    "name": "Paras Defence and Space Tech",
    "symbol": "PARAS.NS",
    "type": "stock"
  },
  {
    "name": "MTAR Technologies Ltd",
    "symbol": "MTAR.NS",
    "type": "stock"
  },
  {
    "name": "Astra Microwave Products Ltd",
    "symbol": "ASTRAMICRO.NS",
    "type": "stock"
  },
  {
    "name": "Centum Electronics Ltd",
    "symbol": "CENTUM.NS",
    "type": "stock"
  },
  {
    "name": "Dixon Technologies India Ltd",
    "symbol": "DIXON.NS",
    "type": "stock"
  },
  {
    "name": "Amber Enterprises India Ltd",
    "symbol": "AMBER.NS",
    "type": "stock"
  },
  {
    "name": "PG Electroplast Ltd",
    "symbol": "PGEL.NS",
    "type": "stock"
  },
  {
    "name": "Kaynes Technology India Ltd",
    "symbol": "KAYNES.NS",
    "type": "stock"
  },
  {
    "name": "Syrma SGS Technology Ltd",
    "symbol": "SYRMA.NS",
    "type": "stock"
  },
  {
    "name": "Elin Electronics Ltd",
    "symbol": "ELIN.NS",
    "type": "stock"
  },
  {
    "name": "Avalon Technologies Ltd",
    "symbol": "AVALON.NS",
    "type": "stock"
  },
  {
    "name": "Ideaforge Technology Ltd",
    "symbol": "IDEAFORGE.NS",
    "type": "stock"
  },
  {
    "name": "Aeroflex Industries Ltd",
    "symbol": "AEROFLEX.NS",
    "type": "stock"
  },
  {
    "name": "MSTC Ltd",
    "symbol": "MSTCLTD.NS",
    "type": "stock"
  },
  {
    "name": "NMDC Ltd",
    "symbol": "NMDC.NS",
    "type": "stock"
  },
  {
    "name": "Hindustan Copper Ltd",
    "symbol": "HINDCOPPER.NS",
    "type": "stock"
  },
  {
    "name": "National Aluminium Company Ltd",
    "symbol": "NATIONALUM.NS",
    "type": "stock"
  },
  {
    "name": "Mangalore Refinery & Petrochemicals",
    "symbol": "MRPL.NS",
    "type": "stock"
  },
  {
    "name": "Chennai Petroleum Corporation Ltd",
    "symbol": "CHENNPETRO.NS",
    "type": "stock"
  },
  {
    "name": "HPCL (Hindustan Petroleum)",
    "symbol": "HINDPETRO.NS",
    "type": "stock"
  },
  {
    "name": "BPCL (Bharat Petroleum)",
    "symbol": "BPCL.NS",
    "type": "stock"
  },
  {
    "name": "Indian Oil Corporation Ltd",
    "symbol": "IOC.NS",
    "type": "stock"
  },
  {
    "name": "GAIL (India) Ltd",
    "symbol": "GAIL.NS",
    "type": "stock"
  },
  {
    "name": "Petronet LNG Ltd",
    "symbol": "PETRONET.NS",
    "type": "stock"
  },
  {
    "name": "Indraprastha Gas Ltd",
    "symbol": "IGL.NS",
    "type": "stock"
  },
  {
    "name": "Mahanagar Gas Ltd",
    "symbol": "MGL.NS",
    "type": "stock"
  },
  {
    "name": "Gujarat Gas Ltd",
    "symbol": "GUJGAS.NS",
    "type": "stock"
  },
  {
    "name": "Torrent Gas Ltd",
    "symbol": "TORNTGAS.NS",
    "type": "stock"
  },
  {
    "name": "Adani Gas Ltd",
    "symbol": "ADANIGAS.NS",
    "type": "stock"
  },
  {
    "name": "Gujarat State Petronet Ltd",
    "symbol": "GSPL.NS",
    "type": "stock"
  },
  {
    "name": "Aegis Logistics Ltd",
    "symbol": "AEGISCHEM.NS",
    "type": "stock"
  },
  {
    "name": "SEAMEC Ltd",
    "symbol": "SEAMEC.NS",
    "type": "stock"
  },
  {
    "name": "Selan Exploration Technology Ltd",
    "symbol": "SELAN.NS",
    "type": "stock"
  },
  {
    "name": "HOEC (Hindustan Oil Exploration)",
    "symbol": "HOEC.NS",
    "type": "stock"
  },
  {
    "name": "Deep Industries Ltd",
    "symbol": "DEEPIND.NS",
    "type": "stock"
  },
  {
    "name": "Alphageo (India) Ltd",
    "symbol": "ALPHAGEO.NS",
    "type": "stock"
  },
  {
    "name": "Medanta (Global Health Ltd)",
    "symbol": "GLOBALHEALTH.NS",
    "type": "stock"
  },
  {
    "name": "Max Healthcare Institute Ltd",
    "symbol": "MAXHEALTH.NS",
    "type": "stock"
  },
  {
    "name": "Fortis Healthcare Ltd",
    "symbol": "FORTIS.NS",
    "type": "stock"
  },
  {
    "name": "Narayana Hrudayalaya Ltd",
    "symbol": "NH.NS",
    "type": "stock"
  },
  {
    "name": "HCG (Healthcare Global Enterprises)",
    "symbol": "HCG.NS",
    "type": "stock"
  },
  {
    "name": "Aster DM Healthcare Ltd",
    "symbol": "ASTERDM.NS",
    "type": "stock"
  },
  {
    "name": "Shalby Ltd",
    "symbol": "SHALBY.NS",
    "type": "stock"
  },
  {
    "name": "Krsnaa Diagnostics Ltd",
    "symbol": "KRSNAA.NS",
    "type": "stock"
  },
  {
    "name": "Metropolis Healthcare Ltd",
    "symbol": "METROPOLIS.NS",
    "type": "stock"
  },
  {
    "name": "Dr Lal PathLabs Ltd",
    "symbol": "LALPATHLAB.NS",
    "type": "stock"
  },
  {
    "name": "Thyrocare Technologies Ltd",
    "symbol": "THYROCARE.NS",
    "type": "stock"
  },
  {
    "name": "Vijaya Diagnostic Centre Ltd",
    "symbol": "VIJAYA.NS",
    "type": "stock"
  },
  {
    "name": "SRL Diagnostics Ltd",
    "symbol": "SRLDIAG.NS",
    "type": "stock"
  },
  {
    "name": "Healthium Medtech Ltd",
    "symbol": "HEALTHIUM.NS",
    "type": "stock"
  },
  {
    "name": "Poly Medicure Ltd",
    "symbol": "POLYMED.NS",
    "type": "stock"
  },
  {
    "name": "Skanray Technologies Ltd",
    "symbol": "SKANRAY.NS",
    "type": "stock"
  },
  {
    "name": "Trivitron Healthcare Ltd",
    "symbol": "TRIVITRON.NS",
    "type": "stock"
  },
  {
    "name": "Optiemus Infracom Ltd",
    "symbol": "OPTIEMUS.NS",
    "type": "stock"
  },
  {
    "name": "India Power Corporation Ltd",
    "symbol": "INDIAPOWER.NS",
    "type": "stock"
  },
  {
    "name": "CESC Ltd",
    "symbol": "CESC.NS",
    "type": "stock"
  },
  {
    "name": "Tata Power Company Ltd",
    "symbol": "TATAPOWER.NS",
    "type": "stock"
  },
  {
    "name": "JSW Energy Ltd",
    "symbol": "JSWENERGY.NS",
    "type": "stock"
  },
  {
    "name": "Torrent Power Ltd",
    "symbol": "TORNTPOWER.NS",
    "type": "stock"
  },
  {
    "name": "CLP India Ltd",
    "symbol": "CLP.NS",
    "type": "stock"
  },
  {
    "name": "Greenko Energy Holdings",
    "symbol": "GREENKO.NS",
    "type": "stock"
  },
  {
    "name": "Azure Power Global Ltd",
    "symbol": "AZUREPOWER.NS",
    "type": "stock"
  },
  {
    "name": "ReNew Power Ventures",
    "symbol": "RENEWPOW.NS",
    "type": "stock"
  },
  {
    "name": "Inox Wind Ltd",
    "symbol": "INOXWIND.NS",
    "type": "stock"
  },
  {
    "name": "Suzlon Energy Ltd",
    "symbol": "SUZLON.NS",
    "type": "stock"
  },
  {
    "name": "Orient Green Power Company Ltd",
    "symbol": "ORIENTGRN.NS",
    "type": "stock"
  },
  {
    "name": "Websol Energy System Ltd",
    "symbol": "WEBSOL.NS",
    "type": "stock"
  },
  {
    "name": "Borosil Renewables Ltd",
    "symbol": "BORORENEW.NS",
    "type": "stock"
  },
  {
    "name": "Waaree Energies Ltd",
    "symbol": "WAAREE.NS",
    "type": "stock"
  },
  {
    "name": "Premier Energies Ltd",
    "symbol": "PREMIERENE.NS",
    "type": "stock"
  },
  {
    "name": "Vikram Solar Ltd",
    "symbol": "VIKRAMSOL.NS",
    "type": "stock"
  },
  {
    "name": "Ircon International Ltd",
    "symbol": "IRCON.NS",
    "type": "stock"
  },
  {
    "name": "RITES Ltd",
    "symbol": "RITES.NS",
    "type": "stock"
  },
  {
    "name": "NBCC (India) Ltd",
    "symbol": "NBCC.NS",
    "type": "stock"
  },
  {
    "name": "NCC Ltd",
    "symbol": "NCC.NS",
    "type": "stock"
  },
  {
    "name": "Ahluwalia Contracts (India) Ltd",
    "symbol": "AHLUCONT.NS",
    "type": "stock"
  },
  {
    "name": "PNC Infratech Ltd",
    "symbol": "PNCINFRA.NS",
    "type": "stock"
  },
  {
    "name": "H.G. Infra Engineering Ltd",
    "symbol": "HGINFRA.NS",
    "type": "stock"
  },
  {
    "name": "KNR Constructions Ltd",
    "symbol": "KNRCON.NS",
    "type": "stock"
  },
  {
    "name": "Dilip Buildcon Ltd",
    "symbol": "DBL.NS",
    "type": "stock"
  },
  {
    "name": "Sadbhav Engineering Ltd",
    "symbol": "SADBHAV.NS",
    "type": "stock"
  },
  {
    "name": "Ashoka Buildcon Ltd",
    "symbol": "ASHOKA.NS",
    "type": "stock"
  },
  {
    "name": "Oriental Rail Infrastructure Ltd",
    "symbol": "ORIENTALTL.NS",
    "type": "stock"
  },
  {
    "name": "MTNL (Mahanagar Telephone Nigam)",
    "symbol": "MTNL.NS",
    "type": "stock"
  },
  {
    "name": "BSNL (Bharat Sanchar Nigam)",
    "symbol": "BSNL.NS",
    "type": "stock"
  },
  {
    "name": "Vodafone Idea Ltd",
    "symbol": "IDEA.NS",
    "type": "stock"
  },
  {
    "name": "Tata Teleservices (Maharashtra)",
    "symbol": "TTML.NS",
    "type": "stock"
  },
  {
    "name": "Route Mobile Ltd",
    "symbol": "ROUTE.NS",
    "type": "stock"
  },
  {
    "name": "HFCL Ltd",
    "symbol": "HFCL.NS",
    "type": "stock"
  },
  {
    "name": "ITI Ltd",
    "symbol": "ITI.NS",
    "type": "stock"
  },
  {
    "name": "Tejas Networks Ltd",
    "symbol": "TEJASNET.NS",
    "type": "stock"
  },
  {
    "name": "Railtel Corporation of India Ltd",
    "symbol": "RAILTEL.NS",
    "type": "stock"
  },
  {
    "name": "BFSL (Bajaj Financial Securities)",
    "symbol": "BFSL.NS",
    "type": "stock"
  },
  {
    "name": "Angel One Ltd",
    "symbol": "ANGELONE.NS",
    "type": "stock"
  },
  {
    "name": "Motilal Oswal Financial Services",
    "symbol": "MOTILALOFS.NS",
    "type": "stock"
  },
  {
    "name": "ICICI Securities Ltd",
    "symbol": "ISEC.NS",
    "type": "stock"
  },
  {
    "name": "HDFC Securities Ltd",
    "symbol": "HDFCSEC.NS",
    "type": "stock"
  },
  {
    "name": "Geojit Financial Services Ltd",
    "symbol": "GEOJIT.NS",
    "type": "stock"
  },
  {
    "name": "5paisa Capital Ltd",
    "symbol": "5PAISA.NS",
    "type": "stock"
  },
  {
    "name": "Edelweiss Financial Services Ltd",
    "symbol": "EDELWEISS.NS",
    "type": "stock"
  },
  {
    "name": "JM Financial Ltd",
    "symbol": "JMFINANCIL.NS",
    "type": "stock"
  },
  {
    "name": "Emkay Global Financial Services",
    "symbol": "EMKAY.NS",
    "type": "stock"
  },
  {
    "name": "Anand Rathi Wealth Ltd",
    "symbol": "ANANDRATHI.NS",
    "type": "stock"
  },
  {
    "name": "360 One WAM Ltd",
    "symbol": "360ONE.NS",
    "type": "stock"
  },
  {
    "name": "Nuvama Wealth Management Ltd",
    "symbol": "NUVAMA.NS",
    "type": "stock"
  },
  {
    "name": "IIFL Wealth Management Ltd",
    "symbol": "IIFLWAM.NS",
    "type": "stock"
  },
  {
    "name": "UTI Asset Management Company",
    "symbol": "UTIAMC.NS",
    "type": "stock"
  },
  {
    "name": "HDFC Asset Management Company",
    "symbol": "HDFCAMC.NS",
    "type": "stock"
  },
  {
    "name": "Nippon Life India Asset Management",
    "symbol": "NAM-INDIA.NS",
    "type": "stock"
  },
  {
    "name": "Aditya Birla Sun Life AMC Ltd",
    "symbol": "ABSLAMC.NS",
    "type": "stock"
  },
  {
    "name": "SBI Funds Management Ltd",
    "symbol": "SBIMF.NS",
    "type": "stock"
  },
  {
    "name": "ICICI Prudential AMC Ltd",
    "symbol": "IPRU.NS",
    "type": "stock"
  },
  {
    "name": "Kotak Mahindra AMC Ltd",
    "symbol": "KOTMAHAMO.NS",
    "type": "stock"
  },
  {
    "name": "DSP Investment Managers Ltd",
    "symbol": "DSP.NS",
    "type": "stock"
  },
  {
    "name": "Mirae Asset Investment Managers",
    "symbol": "MIRAE.NS",
    "type": "stock"
  },
  {
    "name": "Franklin Templeton Asset Mgmt",
    "symbol": "FRANKTEMP.NS",
    "type": "stock"
  },
  {
    "name": "General Insurance Corporation of India",
    "symbol": "GICRE.NS",
    "type": "stock"
  },
  {
    "name": "The New India Assurance Co Ltd",
    "symbol": "NIACL.NS",
    "type": "stock"
  },
  {
    "name": "United India Insurance Co Ltd",
    "symbol": "UIICL.NS",
    "type": "stock"
  },
  {
    "name": "National Insurance Co Ltd",
    "symbol": "NATINSUR.NS",
    "type": "stock"
  },
  {
    "name": "Star Health and Allied Insurance",
    "symbol": "STARHEALTH.NS",
    "type": "stock"
  },
  {
    "name": "Niva Bupa Health Insurance",
    "symbol": "NIVABUPA.NS",
    "type": "stock"
  },
  {
    "name": "Care Health Insurance Ltd",
    "symbol": "CAREHEALTH.NS",
    "type": "stock"
  },
  {
    "name": "ManipalCigna Health Insurance",
    "symbol": "MANIPALCIG.NS",
    "type": "stock"
  },
  {
    "name": "HDFC ERGO General Insurance",
    "symbol": "HDFCERGO.NS",
    "type": "stock"
  },
  {
    "name": "ICICI Lombard General Insurance",
    "symbol": "ICICIGI.NS",
    "type": "stock"
  },
  {
    "name": "Bajaj Allianz General Insurance",
    "symbol": "BAJAJALANZ.NS",
    "type": "stock"
  },
  {
    "name": "Tata AIG General Insurance",
    "symbol": "TATAAIG.NS",
    "type": "stock"
  },
  {
    "name": "Cholamandalam MS General Insurance",
    "symbol": "CHOLAMS.NS",
    "type": "stock"
  },
  {
    "name": "Future Generali India Insurance",
    "symbol": "FUTGENINS.NS",
    "type": "stock"
  },
  {
    "name": "MCX (Multi Commodity Exchange)",
    "symbol": "MCX.NS",
    "type": "stock"
  },
  {
    "name": "BSE Ltd",
    "symbol": "BSE.NS",
    "type": "stock"
  },
  {
    "name": "NSE (National Stock Exchange)",
    "symbol": "NSE.NS",
    "type": "stock"
  },
  {
    "name": "CDSL (Central Depository Services)",
    "symbol": "CDSL.NS",
    "type": "stock"
  },
  {
    "name": "Computer Age Management Services",
    "symbol": "CAMS.NS",
    "type": "stock"
  },
  {
    "name": "KFin Technologies Ltd",
    "symbol": "KFINTECH.NS",
    "type": "stock"
  },
  {
    "name": "National Securities Depository Ltd",
    "symbol": "NSDL.NS",
    "type": "stock"
  },
  {
    "name": "CRISIL Ltd",
    "symbol": "CRISIL.NS",
    "type": "stock"
  },
  {
    "name": "ICRA Ltd",
    "symbol": "ICRA.NS",
    "type": "stock"
  },
  {
    "name": "Care Ratings Ltd",
    "symbol": "CARERATING.NS",
    "type": "stock"
  },
  {
    "name": "Acuite Ratings & Research Ltd",
    "symbol": "ACUITERATG.NS",
    "type": "stock"
  },
  {
    "name": "SBI Cards & Payment Services Ltd",
    "symbol": "SBICARD.NS",
    "type": "stock"
  },
  {
    "name": "HDFC Bank Credit Card",
    "symbol": "HDFCCC.NS",
    "type": "stock"
  },
  {
    "name": "RuPay (NPCI)",
    "symbol": "RUPAY.NS",
    "type": "stock"
  },
  {
    "name": "BillDesk Ltd",
    "symbol": "BILLDESK.NS",
    "type": "stock"
  },
  {
    "name": "PayU India (Prosus)",
    "symbol": "PAYU.NS",
    "type": "stock"
  },
  {
    "name": "Razorpay Software Pvt Ltd",
    "symbol": "RAZORPAY.NS",
    "type": "stock"
  },
  {
    "name": "Cashfree Payments India Pvt Ltd",
    "symbol": "CASHFREE.NS",
    "type": "stock"
  },
  {
    "name": "Pine Labs Pvt Ltd",
    "symbol": "PINELABS.NS",
    "type": "stock"
  },
  {
    "name": "MobiKwik Systems Ltd",
    "symbol": "MOBIKWIK.NS",
    "type": "stock"
  },
  {
    "name": "Kissht (Ring Plus Aqua Ltd)",
    "symbol": "KISSHT.NS",
    "type": "stock"
  },
  {
    "name": "Capital Float (Gauge Capital)",
    "symbol": "CAPFLOAT.NS",
    "type": "stock"
  },
  {
    "name": "Lendingkart Finance Ltd",
    "symbol": "LENDKART.NS",
    "type": "stock"
  },
  {
    "name": "NeoGrowth Credit Pvt Ltd",
    "symbol": "NEOGROWTH.NS",
    "type": "stock"
  },
  {
    "name": "Kinara Capital Ltd",
    "symbol": "KINARA.NS",
    "type": "stock"
  },
  {
    "name": "Aye Finance Pvt Ltd",
    "symbol": "AYE.NS",
    "type": "stock"
  },
  {
    "name": "Veritas Finance Pvt Ltd",
    "symbol": "VERITAS.NS",
    "type": "stock"
  },
  {
    "name": "Vidhi Specialty Food Ingredients",
    "symbol": "VIDHIING.NS",
    "type": "stock"
  },
  {
    "name": "Alkyl Amines Chemicals Ltd",
    "symbol": "ALKYLAMINE.NS",
    "type": "stock"
  },
  {
    "name": "Nocil Ltd",
    "symbol": "NOCIL.NS",
    "type": "stock"
  },
  {
    "name": "Solar Industries India Ltd",
    "symbol": "SOLARINDS.NS",
    "type": "stock"
  },
  {
    "name": "Paushak Ltd",
    "symbol": "PAUSHAK.NS",
    "type": "stock"
  },
  {
    "name": "Gujarat Alkalies & Chemicals Ltd",
    "symbol": "GUJALKALI.NS",
    "type": "stock"
  },
  {
    "name": "Tata Metaliks Ltd",
    "symbol": "TATAMETALI.NS",
    "type": "stock"
  },
  {
    "name": "Electrosteel Castings Ltd",
    "symbol": "ELECTCAST.NS",
    "type": "stock"
  },
  {
    "name": "Welcast Steels Ltd",
    "symbol": "WELCAST.NS",
    "type": "stock"
  },
  {
    "name": "Lloyds Metals and Energy Ltd",
    "symbol": "LLOYDSME.NS",
    "type": "stock"
  },
  {
    "name": "Shyam Metalics and Energy Ltd",
    "symbol": "SHYAMMETL.NS",
    "type": "stock"
  },
  {
    "name": "Sarda Energy & Minerals Ltd",
    "symbol": "SARDAEN.NS",
    "type": "stock"
  },
  {
    "name": "Gallantt Ispat Ltd",
    "symbol": "GALLANTT.NS",
    "type": "stock"
  },
  {
    "name": "MSP Steel & Power Ltd",
    "symbol": "MSPSTEEL.NS",
    "type": "stock"
  },
  {
    "name": "Vaibhav Global Ltd",
    "symbol": "VAIBHAVGBL.NS",
    "type": "stock"
  },
  {
    "name": "Thangamayil Jewellery Ltd",
    "symbol": "THANGAMAYL.NS",
    "type": "stock"
  },
  {
    "name": "PC Jeweller Ltd",
    "symbol": "PCJEWELLER.NS",
    "type": "stock"
  },
  {
    "name": "Senco Gold Ltd",
    "symbol": "SENCO.NS",
    "type": "stock"
  },
  {
    "name": "Kalyan Jewellers India Ltd",
    "symbol": "KALYANKJIL.NS",
    "type": "stock"
  },
  {
    "name": "Tribhovandas Bhimji Zaveri Ltd",
    "symbol": "TBZ.NS",
    "type": "stock"
  },
  {
    "name": "Malabar Gold and Diamonds",
    "symbol": "MALABAR.NS",
    "type": "stock"
  },
  {
    "name": "CaratLane Trading Ltd",
    "symbol": "CARATLANE.NS",
    "type": "stock"
  },
  {
    "name": "PNGJewellers Ltd",
    "symbol": "PNG.NS",
    "type": "stock"
  },
  {
    "name": "Bharat Wire Ropes Ltd",
    "symbol": "BHARATWIRE.NS",
    "type": "stock"
  },
  {
    "name": "Usha Martin Ltd",
    "symbol": "USHAMART.NS",
    "type": "stock"
  },
  {
    "name": "Tata Wiron Ltd",
    "symbol": "TATAWIRE.NS",
    "type": "stock"
  },
  {
    "name": "Jai Balaji Industries Ltd",
    "symbol": "JAIBALAJI.NS",
    "type": "stock"
  },
  {
    "name": "Rashmi Metaliks Ltd",
    "symbol": "RASHMI.NS",
    "type": "stock"
  },
  {
    "name": "Prakash Industries Ltd",
    "symbol": "PRAKASH.NS",
    "type": "stock"
  },
  {
    "name": "Monnet Ispat and Energy Ltd",
    "symbol": "MONNETISPA.NS",
    "type": "stock"
  },
  {
    "name": "Jindal Stainless Ltd",
    "symbol": "JSL.NS",
    "type": "stock"
  },
  {
    "name": "Jindal Stainless (Hisar) Ltd",
    "symbol": "JSLHISAR.NS",
    "type": "stock"
  },
  {
    "name": "Outokumpu India Ltd",
    "symbol": "OUTOKUMPU.NS",
    "type": "stock"
  },
  {
    "name": "APL Apollo Tubes Ltd",
    "symbol": "APLAPOLLO.NS",
    "type": "stock"
  },
  {
    "name": "Surya Roshni Ltd",
    "symbol": "SURYAROSNI.NS",
    "type": "stock"
  },
  {
    "name": "Man Industries (India) Ltd",
    "symbol": "MANINDS.NS",
    "type": "stock"
  },
  {
    "name": "Ratnamani Metals and Tubes Ltd",
    "symbol": "RATNAMANI.NS",
    "type": "stock"
  },
  {
    "name": "Maharashtra Seamless Ltd",
    "symbol": "MAHSEAMLES.NS",
    "type": "stock"
  },
  {
    "name": "Pennar Industries Ltd",
    "symbol": "PENIND.NS",
    "type": "stock"
  },
  {
    "name": "Mold-Tek Packaging Ltd",
    "symbol": "MOLDTKPAC.NS",
    "type": "stock"
  },
  {
    "name": "Time Technoplast Ltd",
    "symbol": "TIMETECHNO.NS",
    "type": "stock"
  },
  {
    "name": "Manjushree Technopack Ltd",
    "symbol": "MJTL.NS",
    "type": "stock"
  },
  {
    "name": "EPL Ltd (Essel Propack)",
    "symbol": "EPL.NS",
    "type": "stock"
  },
  {
    "name": "Huhtamaki India Ltd",
    "symbol": "HUHTAMAKI.NS",
    "type": "stock"
  },
  {
    "name": "Uflex Ltd",
    "symbol": "UFLEX.NS",
    "type": "stock"
  },
  {
    "name": "Cosmo First Ltd",
    "symbol": "COSMOFIRST.NS",
    "type": "stock"
  },
  {
    "name": "Jindal Poly Films Ltd",
    "symbol": "JINDALPOLY.NS",
    "type": "stock"
  },
  {
    "name": "Manali Petrochemicals Ltd",
    "symbol": "MANALIPETC.NS",
    "type": "stock"
  },
  {
    "name": "Gujarat Narmada Valley Fertilizers",
    "symbol": "GNFC.NS",
    "type": "stock"
  },
  {
    "name": "Deepak Fertilisers & Petrochemicals",
    "symbol": "DEEPAKFERT.NS",
    "type": "stock"
  },
  {
    "name": "FACT (Fertilizers & Chemicals Travancore)",
    "symbol": "FACT.NS",
    "type": "stock"
  },
  {
    "name": "Tata Fertilizers Ltd",
    "symbol": "TATAFERT.NS",
    "type": "stock"
  },
  {
    "name": "Indian Potash Ltd",
    "symbol": "INDIANPTAS.NS",
    "type": "stock"
  },
  {
    "name": "Zuari Agro Chemicals Ltd",
    "symbol": "ZUARI.NS",
    "type": "stock"
  },
  {
    "name": "Paradeep Phosphates Ltd",
    "symbol": "PARADEEP.NS",
    "type": "stock"
  },
  {
    "name": "Khaitan Chemicals & Fertilizers",
    "symbol": "KHAITAN.NS",
    "type": "stock"
  },
  {
    "name": "Jagran Prakashan Ltd",
    "symbol": "JAGRAN.NS",
    "type": "stock"
  },
  {
    "name": "DB Corp Ltd",
    "symbol": "DBCORP.NS",
    "type": "stock"
  },
  {
    "name": "HT Media Ltd",
    "symbol": "HTMEDIA.NS",
    "type": "stock"
  },
  {
    "name": "Deccan Chronicle Holdings Ltd",
    "symbol": "DECCHRONI.NS",
    "type": "stock"
  },
  {
    "name": "Sun TV Network Ltd",
    "symbol": "SUNTV.NS",
    "type": "stock"
  },
  {
    "name": "Zee Entertainment Enterprises",
    "symbol": "ZEEL.NS",
    "type": "stock"
  },
  {
    "name": "Sony Pictures Networks India",
    "symbol": "SONY.NS",
    "type": "stock"
  },
  {
    "name": "Dish TV India Ltd",
    "symbol": "DISHTV.NS",
    "type": "stock"
  },
  {
    "name": "Tata Sky Ltd (Tata Play)",
    "symbol": "TATASKY.NS",
    "type": "stock"
  },
  {
    "name": "Hathway Cable & Datacom Ltd",
    "symbol": "HATHWAY.NS",
    "type": "stock"
  },
  {
    "name": "Den Networks Ltd",
    "symbol": "DEN.NS",
    "type": "stock"
  },
  {
    "name": "Network18 Media & Investments",
    "symbol": "NETWORK18.NS",
    "type": "stock"
  },
  {
    "name": "TV18 Broadcast Ltd",
    "symbol": "TV18BRDCST.NS",
    "type": "stock"
  },
  {
    "name": "NDTV (New Delhi Television)",
    "symbol": "NDTV.NS",
    "type": "stock"
  },
  {
    "name": "Times Network Ltd",
    "symbol": "TIMESNET.NS",
    "type": "stock"
  },
  {
    "name": "India Today Group Ltd",
    "symbol": "INDIATODAY.NS",
    "type": "stock"
  },
  {
    "name": "Balaji Telefilms Ltd",
    "symbol": "BALAJITELE.NS",
    "type": "stock"
  },
  {
    "name": "Shemaroo Entertainment Ltd",
    "symbol": "SHEMAROO.NS",
    "type": "stock"
  },
  {
    "name": "Eros International Media Ltd",
    "symbol": "EROSMEDIA.NS",
    "type": "stock"
  },
  {
    "name": "Saregama India Ltd",
    "symbol": "SAREGAMA.NS",
    "type": "stock"
  },
  {
    "name": "Tips Music Ltd",
    "symbol": "TIPSINDLTD.NS",
    "type": "stock"
  },
  {
    "name": "Music Broadcast Ltd (Radio City)",
    "symbol": "MUSICBCAST.NS",
    "type": "stock"
  },
  {
    "name": "Next Mediaworks Ltd",
    "symbol": "NEXTMEDIA.NS",
    "type": "stock"
  },
  {
    "name": "Entertainment Network India (Radio Mirchi)",
    "symbol": "ENIL.NS",
    "type": "stock"
  },
  {
    "name": "Zee Media Corporation Ltd",
    "symbol": "ZEEMEDIA.NS",
    "type": "stock"
  },
  {
    "name": "Lemon Tree Hotels Ltd",
    "symbol": "LEMONTREE.NS",
    "type": "stock"
  },
  {
    "name": "Indian Hotels Company Ltd (Taj)",
    "symbol": "INDHOTEL.NS",
    "type": "stock"
  },
  {
    "name": "EIH Ltd (Oberoi Hotels)",
    "symbol": "EIHOTEL.NS",
    "type": "stock"
  },
  {
    "name": "ITC Hotels Ltd",
    "symbol": "ITCHOTELS.NS",
    "type": "stock"
  },
  {
    "name": "Mahindra Holidays & Resorts India",
    "symbol": "MHRIL.NS",
    "type": "stock"
  },
  {
    "name": "Thomas Cook (India) Ltd",
    "symbol": "THOMASCOOK.NS",
    "type": "stock"
  },
  {
    "name": "Cox & Kings Ltd",
    "symbol": "COXANDKNG.NS",
    "type": "stock"
  },
  {
    "name": "Cleartrip Pvt Ltd",
    "symbol": "CLEARTRIP.NS",
    "type": "stock"
  },
  {
    "name": "MakeMyTrip Ltd",
    "symbol": "MMYT.NS",
    "type": "stock"
  },
  {
    "name": "Yatra Online Ltd",
    "symbol": "YATRA.NS",
    "type": "stock"
  },
  {
    "name": "RateGain Travel Technologies Ltd",
    "symbol": "RATEGAIN.NS",
    "type": "stock"
  },
  {
    "name": "Ixigo (Le Travenues Technology)",
    "symbol": "IXIGO.NS",
    "type": "stock"
  },
  {
    "name": "Easy Trip Planners Ltd (EaseMyTrip)",
    "symbol": "EASEMYTRIP.NS",
    "type": "stock"
  },
  {
    "name": "Ola (ANI Technologies)",
    "symbol": "OLA.NS",
    "type": "stock"
  },
  {
    "name": "Rapido (Roppen Transportation)",
    "symbol": "RAPIDO.NS",
    "type": "stock"
  },
  {
    "name": "Meru Mobility Tech Ltd",
    "symbol": "MERU.NS",
    "type": "stock"
  },
  {
    "name": "Uber India Systems Pvt Ltd",
    "symbol": "UBER.NS",
    "type": "stock"
  },
  {
    "name": "BluSmart Mobility Ltd",
    "symbol": "BLUSMART.NS",
    "type": "stock"
  },
  {
    "name": "Mahindra Logistics Ltd",
    "symbol": "MAHLOG.NS",
    "type": "stock"
  },
  {
    "name": "TCI Express Ltd",
    "symbol": "TCIEXP.NS",
    "type": "stock"
  },
  {
    "name": "Blue Dart Express Ltd",
    "symbol": "BLUEDART.NS",
    "type": "stock"
  },
  {
    "name": "DTDC Express Ltd",
    "symbol": "DTDC.NS",
    "type": "stock"
  },
  {
    "name": "Gati Ltd",
    "symbol": "GATI.NS",
    "type": "stock"
  },
  {
    "name": "VRL Logistics Ltd",
    "symbol": "VRLLOG.NS",
    "type": "stock"
  },
  {
    "name": "Transport Corporation of India Ltd",
    "symbol": "TCI.NS",
    "type": "stock"
  },
  {
    "name": "Allcargo Logistics Ltd",
    "symbol": "ALLCARGO.NS",
    "type": "stock"
  },
  {
    "name": "Gateway Distriparks Ltd",
    "symbol": "GDL.NS",
    "type": "stock"
  },
  {
    "name": "Snowman Logistics Ltd",
    "symbol": "SNOWMAN.NS",
    "type": "stock"
  },
  {
    "name": "Mahindra & Mahindra (Agri Division)",
    "symbol": "MMFSL.NS",
    "type": "stock"
  },
  {
    "name": "Escorts Kubota Ltd",
    "symbol": "ESCORTS.NS",
    "type": "stock"
  },
  {
    "name": "International Tractors Ltd (Sonalika)",
    "symbol": "INTLTRACT.NS",
    "type": "stock"
  },
  {
    "name": "TAFE (Tractors and Farm Equipment)",
    "symbol": "TAFE.NS",
    "type": "stock"
  },
  {
    "name": "Preet Agro Industries Ltd",
    "symbol": "PREET.NS",
    "type": "stock"
  },
  {
    "name": "Standard Industries Ltd",
    "symbol": "STANDINDS.NS",
    "type": "stock"
  },
  {
    "name": "Syngenta India Ltd",
    "symbol": "SYNGENTA.NS",
    "type": "stock"
  },
  {
    "name": "FMC India Ltd",
    "symbol": "FMCIND.NS",
    "type": "stock"
  },
  {
    "name": "Corteva Agriscience India",
    "symbol": "CORTEVA.NS",
    "type": "stock"
  },
  {
    "name": "Atul Ltd",
    "symbol": "ATUL.NS",
    "type": "stock"
  },
  {
    "name": "Galaxy Surfactants Ltd",
    "symbol": "GALAXYSURF.NS",
    "type": "stock"
  },
  {
    "name": "Fine Organic Industries Ltd",
    "symbol": "FINEORG.NS",
    "type": "stock"
  },
  {
    "name": "Camlin Fine Sciences Ltd",
    "symbol": "CAMLINFINE.NS",
    "type": "stock"
  },
  {
    "name": "Rossari Biotech Ltd",
    "symbol": "ROSSARI.NS",
    "type": "stock"
  },
  {
    "name": "Aarti Surfactants Ltd",
    "symbol": "AARTISUR.NS",
    "type": "stock"
  },
  {
    "name": "Halonix Technologies Ltd",
    "symbol": "HALONIX.NS",
    "type": "stock"
  },
  {
    "name": "Philips India Ltd",
    "symbol": "PHILIPS.NS",
    "type": "stock"
  },
  {
    "name": "Fiem Industries Ltd",
    "symbol": "FIEMIND.NS",
    "type": "stock"
  },
  {
    "name": "Lumax Industries Ltd",
    "symbol": "LUMAXIND.NS",
    "type": "stock"
  },
  {
    "name": "Lumax Auto Technologies Ltd",
    "symbol": "LUMAXTECH.NS",
    "type": "stock"
  },
  {
    "name": "Minda Corporation Ltd",
    "symbol": "MINDACORP.NS",
    "type": "stock"
  },
  {
    "name": "Sandhar Technologies Ltd",
    "symbol": "SANDHAR.NS",
    "type": "stock"
  },
  {
    "name": "Subros Ltd",
    "symbol": "SUBROS.NS",
    "type": "stock"
  },
  {
    "name": "Suprajit Engineering Ltd",
    "symbol": "SUPRAJIT.NS",
    "type": "stock"
  },
  {
    "name": "Bharat Seats Ltd",
    "symbol": "BHARATSEAT.NS",
    "type": "stock"
  },
  {
    "name": "Jay Bharat Maruti Ltd",
    "symbol": "JAYBARMARU.NS",
    "type": "stock"
  },
  {
    "name": "Krishna Maruti Ltd",
    "symbol": "KRISHNAMAR.NS",
    "type": "stock"
  },
  {
    "name": "Sharda Motor Industries Ltd",
    "symbol": "SHARDAMOTR.NS",
    "type": "stock"
  },
  {
    "name": "Rico Auto Industries Ltd",
    "symbol": "RICOAUTO.NS",
    "type": "stock"
  },
  {
    "name": "Automotive Axles Ltd",
    "symbol": "AUTOAXLES.NS",
    "type": "stock"
  },
  {
    "name": "Bosch Ltd",
    "symbol": "BOSCHLTD.NS",
    "type": "stock"
  },
  {
    "name": "Cummins India Ltd",
    "symbol": "CUMMINSIND.NS",
    "type": "stock"
  },
  {
    "name": "Thermax Ltd",
    "symbol": "THERMAX.NS",
    "type": "stock"
  },
  {
    "name": "Grindwell Norton Ltd",
    "symbol": "GRINDWELL.NS",
    "type": "stock"
  },
  {
    "name": "Carborundum Universal Ltd",
    "symbol": "CARBORUNIV.NS",
    "type": "stock"
  },
  {
    "name": "Praj Industries Ltd",
    "symbol": "PRAJIND.NS",
    "type": "stock"
  },
  {
    "name": "KSB Ltd",
    "symbol": "KSB.NS",
    "type": "stock"
  },
  {
    "name": "Kirloskar Oil Engines Ltd",
    "symbol": "KIRLOSENG.NS",
    "type": "stock"
  },
  {
    "name": "Elgi Equipments Ltd",
    "symbol": "ELGIEQUIP.NS",
    "type": "stock"
  },
  {
    "name": "Atlas Copco (India) Ltd",
    "symbol": "ATLASCOPCO.NS",
    "type": "stock"
  },
  {
    "name": "Ingersoll-Rand (India) Ltd",
    "symbol": "INGERRAND.NS",
    "type": "stock"
  },
  {
    "name": "KSFL (Kirloskar Ferrous Industries)",
    "symbol": "KIRLFER.NS",
    "type": "stock"
  },
  {
    "name": "Kirloskar Electric Company Ltd",
    "symbol": "KECL.NS",
    "type": "stock"
  },
  {
    "name": "GE Power India Ltd",
    "symbol": "GEPIL.NS",
    "type": "stock"
  },
  {
    "name": "Bharat Bijlee Ltd",
    "symbol": "BBL.NS",
    "type": "stock"
  },
  {
    "name": "CG Power & Industrial Solutions Ltd",
    "symbol": "CGPOWER.NS",
    "type": "stock"
  },
  {
    "name": "Transformers & Rectifiers India",
    "symbol": "TRIL.NS",
    "type": "stock"
  },
  {
    "name": "Apar Industries Ltd",
    "symbol": "APARINDS.NS",
    "type": "stock"
  },
  {
    "name": "Diamond Power Infrastructure Ltd",
    "symbol": "DIAMOND.NS",
    "type": "stock"
  },
  {
    "name": "EMco Ltd",
    "symbol": "EMCO.NS",
    "type": "stock"
  },
  {
    "name": "Techno Electric & Engineering",
    "symbol": "TECHNOE.NS",
    "type": "stock"
  },
  {
    "name": "PTC India Ltd",
    "symbol": "PTC.NS",
    "type": "stock"
  },
  {
    "name": "CESC Ventures Ltd",
    "symbol": "CESCVENT.NS",
    "type": "stock"
  },
  {
    "name": "Kalpataru Power Transmission",
    "symbol": "KALPATPOWR.NS",
    "type": "stock"
  },
  {
    "name": "KEC International Ltd",
    "symbol": "KEC.NS",
    "type": "stock"
  },
  {
    "name": "Jyoti Structures Ltd",
    "symbol": "JYOTISTRUC.NS",
    "type": "stock"
  },
  {
    "name": "Samvardhana Motherson International",
    "symbol": "MOTHERSON.NS",
    "type": "stock"
  },
  {
    "name": "Castrol India Ltd",
    "symbol": "CASTROLIND.NS",
    "type": "stock"
  },
  {
    "name": "Gulf Oil Lubricants India Ltd",
    "symbol": "GULFOILLUB.NS",
    "type": "stock"
  },
  {
    "name": "Tide Water Oil Co (India) Ltd",
    "symbol": "TIDEWATER.NS",
    "type": "stock"
  },
  {
    "name": "Savita Oil Technologies Ltd",
    "symbol": "SAVITA.NS",
    "type": "stock"
  },
  {
    "name": "Aditya Birla Capital Ltd",
    "symbol": "ABCAPITAL.NS",
    "type": "stock"
  },
  {
    "name": "Piramal Enterprises Ltd",
    "symbol": "PEL.NS",
    "type": "stock"
  },
  {
    "name": "Piramal Pharma Ltd",
    "symbol": "PPLPHARMA.NS",
    "type": "stock"
  },
  {
    "name": "Alembic Pharmaceuticals Ltd",
    "symbol": "APLLTD.NS",
    "type": "stock"
  },
  {
    "name": "Welspun Living Ltd",
    "symbol": "WELSPUNLIV.NS",
    "type": "stock"
  },
  {
    "name": "K.P.R. Mill Ltd",
    "symbol": "KPRMILL.NS",
    "type": "stock"
  },
  {
    "name": "Alok Industries Ltd",
    "symbol": "ALOKINDS.NS",
    "type": "stock"
  },
  {
    "name": "Indo Count Industries Ltd",
    "symbol": "ICIL.NS",
    "type": "stock"
  },
  {
    "name": "Nitin Spinners Ltd",
    "symbol": "NITINSPIN.NS",
    "type": "stock"
  },
  {
    "name": "Vardhman Special Steels Ltd",
    "symbol": "VSSL.NS",
    "type": "stock"
  },
  {
    "name": "Prakash Pipes Ltd",
    "symbol": "PRAKASHPIP.NS",
    "type": "stock"
  },
  {
    "name": "Astral Adhesives Ltd",
    "symbol": "ASTRALADHV.NS",
    "type": "stock"
  },
  {
    "name": "Tata Advanced Systems Ltd",
    "symbol": "TASL.NS",
    "type": "stock"
  },
  {
    "name": "Gabriel India Ltd",
    "symbol": "GABRIEL.NS",
    "type": "stock"
  },
  {
    "name": "Sharda Cropchem Ltd",
    "symbol": "SHARDACROP.NS",
    "type": "stock"
  },
  {
    "name": "Insecticides India Ltd",
    "symbol": "INSECTICID.NS",
    "type": "stock"
  },
  {
    "name": "Best Agrolife Ltd",
    "symbol": "BESTAGROLIFE.NS",
    "type": "stock"
  },
  {
    "name": "Sumitomo Chemical India Ltd",
    "symbol": "SUMICHEM.NS",
    "type": "stock"
  },
  {
    "name": "Meghmani Organics Ltd",
    "symbol": "MEGH.NS",
    "type": "stock"
  },
  {
    "name": "Anupam Rasayan India Ltd",
    "symbol": "ANUPAMR.NS",
    "type": "stock"
  },
  {
    "name": "Tatva Chintan Pharma Chem Ltd",
    "symbol": "TATVA.NS",
    "type": "stock"
  },
  {
    "name": "Supriya Lifescience Ltd",
    "symbol": "SUPRIYA.NS",
    "type": "stock"
  },
  {
    "name": "Shilpa Medicare Ltd",
    "symbol": "SHILPAMED.NS",
    "type": "stock"
  },
  {
    "name": "Sequent Scientific Ltd",
    "symbol": "SEQUENT.NS",
    "type": "stock"
  },
  {
    "name": "Windlas Biotech Ltd",
    "symbol": "WINDLAS.NS",
    "type": "stock"
  },
  {
    "name": "Marksans Pharma Ltd",
    "symbol": "MARKSANS.NS",
    "type": "stock"
  },
  {
    "name": "Piramal Critical Care Ltd",
    "symbol": "PIRCRITI.NS",
    "type": "stock"
  },
  {
    "name": "Themis Medicare Ltd",
    "symbol": "THEMISMED.NS",
    "type": "stock"
  },
  {
    "name": "Morepen Laboratories Ltd",
    "symbol": "MOREPENLAB.NS",
    "type": "stock"
  },
  {
    "name": "Indoco Remedies Ltd",
    "symbol": "INDOCO.NS",
    "type": "stock"
  },
  {
    "name": "Medplus Health Services Ltd",
    "symbol": "MEDPLUS.NS",
    "type": "stock"
  },
  {
    "name": "Tata 1mg Technologies Ltd",
    "symbol": "TATA1MG.NS",
    "type": "stock"
  },
  {
    "name": "Netmeds.com (Reliance Retail)",
    "symbol": "NETMEDS.NS",
    "type": "stock"
  },
  {
    "name": "PharmEasy (API Holdings Ltd)",
    "symbol": "PHARMEASY.NS",
    "type": "stock"
  },
  {
    "name": "Practo Technologies Pvt Ltd",
    "symbol": "PRACTO.NS",
    "type": "stock"
  },
  {
    "name": "Portea Medical Pvt Ltd",
    "symbol": "PORTEA.NS",
    "type": "stock"
  },
  {
    "name": "Healthkart (Bright Lifecare)",
    "symbol": "HEALTHKART.NS",
    "type": "stock"
  },
  {
    "name": "Apollo Pharmacy Ltd",
    "symbol": "APOLLOPHARM.NS",
    "type": "stock"
  },
  {
    "name": "MediBuddy Pvt Ltd",
    "symbol": "MEDIBUDDY.NS",
    "type": "stock"
  },
  {
    "name": "Niramai Health Analytix Pvt Ltd",
    "symbol": "NIRAMAI.NS",
    "type": "stock"
  },
  {
    "name": "Tricog Health Pvt Ltd",
    "symbol": "TRICOG.NS",
    "type": "stock"
  },
  {
    "name": "Sigtuple Technologies Pvt Ltd",
    "symbol": "SIGTUPLE.NS",
    "type": "stock"
  },
  {
    "name": "Holo-lo AI Diagnostics",
    "symbol": "HOLOLO.NS",
    "type": "stock"
  },
  {
    "name": "Byju's (Think & Learn Pvt Ltd)",
    "symbol": "BYJUS.NS",
    "type": "stock"
  },
  {
    "name": "Vedantu Innovations Pvt Ltd",
    "symbol": "VEDANTU.NS",
    "type": "stock"
  },
  {
    "name": "Unacademy (Sorting Hat Technologies)",
    "symbol": "UNACADEMY.NS",
    "type": "stock"
  },
  {
    "name": "upGrad Education Pvt Ltd",
    "symbol": "UPGRAD.NS",
    "type": "stock"
  },
  {
    "name": "NIIT Ltd",
    "symbol": "NIITLTD.NS",
    "type": "stock"
  },
  {
    "name": "Aptech Ltd",
    "symbol": "APTECHT.NS",
    "type": "stock"
  },
  {
    "name": "Everonn Education Ltd",
    "symbol": "EVERONN.NS",
    "type": "stock"
  },
  {
    "name": "Career Point Ltd",
    "symbol": "CAREERP.NS",
    "type": "stock"
  },
  {
    "name": "MT Educare Ltd",
    "symbol": "MTEDUCARE.NS",
    "type": "stock"
  },
  {
    "name": "Treehouse Education & Accessories",
    "symbol": "TREEHOUSE.NS",
    "type": "stock"
  },
  {
    "name": "Zee Learn Ltd",
    "symbol": "ZEELEARN.NS",
    "type": "stock"
  },
  {
    "name": "EuroKids International Pvt Ltd",
    "symbol": "EUROKIDS.NS",
    "type": "stock"
  },
  {
    "name": "Extramarks Education Pvt Ltd",
    "symbol": "EXTRAMARKS.NS",
    "type": "stock"
  },
  {
    "name": "Toppr Technologies Pvt Ltd",
    "symbol": "TOPPR.NS",
    "type": "stock"
  },
  {
    "name": "Simplilearn Solutions Pvt Ltd",
    "symbol": "SIMPLILEARN.NS",
    "type": "stock"
  },
  {
    "name": "GreatLearning (Mogl Technologies)",
    "symbol": "GREATLEARN.NS",
    "type": "stock"
  },
  {
    "name": "Manipal Global Education Services",
    "symbol": "MANIPAL.NS",
    "type": "stock"
  },
  {
    "name": "Amity University Online",
    "symbol": "AMITY.NS",
    "type": "stock"
  },
  {
    "name": "Lovely Professional University",
    "symbol": "LPU.NS",
    "type": "stock"
  },
  {
    "name": "Chandigarh University",
    "symbol": "CHANDIGARU.NS",
    "type": "stock"
  },
  {
    "name": "DY Patil International University",
    "symbol": "DYPATIL.NS",
    "type": "stock"
  },
  {
    "name": "SRM Institute of Science",
    "symbol": "SRMISAT.NS",
    "type": "stock"
  },
  {
    "name": "VIT University",
    "symbol": "VITU.NS",
    "type": "stock"
  },
  {
    "name": "SASTRA University",
    "symbol": "SASTRA.NS",
    "type": "stock"
  },
  {
    "name": "Jain University",
    "symbol": "JAIN.NS",
    "type": "stock"
  },
  {
    "name": "Symbiosis International University",
    "symbol": "SYMBIOSIS.NS",
    "type": "stock"
  },
  {
    "name": "BITS Pilani",
    "symbol": "BITSP.NS",
    "type": "stock"
  },
  {
    "name": "IIT Madras (IIT-M)",
    "symbol": "IITM.NS",
    "type": "stock"
  },
  {
    "name": "IIT Bombay (IIT-B)",
    "symbol": "IITB.NS",
    "type": "stock"
  },
  {
    "name": "IIT Delhi (IIT-D)",
    "symbol": "IITD.NS",
    "type": "stock"
  },
  {
    "name": "IIT Kanpur (IIT-K)",
    "symbol": "IITK.NS",
    "type": "stock"
  },
  {
    "name": "IIT Kharagpur",
    "symbol": "IITKGP.NS",
    "type": "stock"
  },
  {
    "name": "AIIMS Delhi",
    "symbol": "AIIMSD.NS",
    "type": "stock"
  },
  {
    "name": "AIIMS Bhopal",
    "symbol": "AIIMSB.NS",
    "type": "stock"
  },
  {
    "name": "PGI Chandigarh",
    "symbol": "PGIC.NS",
    "type": "stock"
  },
  {
    "name": "JIPMER Puducherry",
    "symbol": "JIPMER.NS",
    "type": "stock"
  },
  {
    "name": "Fortis Hospitals Ltd",
    "symbol": "FORTISHOS.NS",
    "type": "stock"
  },
  {
    "name": "Max Super Speciality Hospital",
    "symbol": "MAXSSH.NS",
    "type": "stock"
  },
  {
    "name": "Medanta The Medicity",
    "symbol": "MEDANTA.NS",
    "type": "stock"
  },
  {
    "name": "Manipal Hospitals Pvt Ltd",
    "symbol": "MANIPALH.NS",
    "type": "stock"
  },
  {
    "name": "Columbia Asia Hospitals Ltd",
    "symbol": "COLUMBIA.NS",
    "type": "stock"
  },
  {
    "name": "Sakra World Hospital",
    "symbol": "SAKRA.NS",
    "type": "stock"
  },
  {
    "name": "Yatharth Hospital Ltd",
    "symbol": "YATHARTH.NS",
    "type": "stock"
  },
  {
    "name": "Sai Life Sciences Ltd",
    "symbol": "SAILIFE.NS",
    "type": "stock"
  },
  {
    "name": "Divi's Laboratories Ltd",
    "symbol": "DIVILAB.NS",
    "type": "stock"
  },
  {
    "name": "Sun Advanced Research Centre",
    "symbol": "SUNRC.NS",
    "type": "stock"
  },
  {
    "name": "Bharat Serums & Vaccines Ltd",
    "symbol": "BSVL.NS",
    "type": "stock"
  },
  {
    "name": "Panacea Biotec Ltd",
    "symbol": "PANACEABIO.NS",
    "type": "stock"
  },
  {
    "name": "Indian Immunologicals Ltd",
    "symbol": "IILM.NS",
    "type": "stock"
  },
  {
    "name": "Biological E Ltd",
    "symbol": "BIOLOE.NS",
    "type": "stock"
  },
  {
    "name": "Serum Institute of India Pvt Ltd",
    "symbol": "SIIPL.NS",
    "type": "stock"
  },
  {
    "name": "Bharat Biotech International",
    "symbol": "BHARATBIO.NS",
    "type": "stock"
  },
  {
    "name": "Zydus Vaccines Ltd",
    "symbol": "ZYDUSVAC.NS",
    "type": "stock"
  },
  {
    "name": "Emcure Pharmaceuticals Ltd",
    "symbol": "EMCURE.NS",
    "type": "stock"
  },
  {
    "name": "Gufic Biosciences Ltd",
    "symbol": "GUFICBIO.NS",
    "type": "stock"
  },
  {
    "name": "Albert David Ltd",
    "symbol": "ALBERTDAV.NS",
    "type": "stock"
  },
  {
    "name": "Ajanta Pharmaceuticals Ltd",
    "symbol": "AJANTPHARM.NS",
    "type": "stock"
  },
  {
    "name": "La Renon Healthcare Ltd",
    "symbol": "LARENON.NS",
    "type": "stock"
  },
  {
    "name": "Suven Pharmaceuticals Ltd",
    "symbol": "SUVEN.NS",
    "type": "stock"
  },
  {
    "name": "Neuland Laboratories Ltd",
    "symbol": "NEULANDLABS.NS",
    "type": "stock"
  },
  {
    "name": "Divi's Laboratories Ltd",
    "symbol": "DIVISLABS.NS",
    "type": "stock"
  },
  {
    "name": "Solara Active Pharma Sciences",
    "symbol": "SOLARA.NS",
    "type": "stock"
  },
  {
    "name": "Optimus Drugs Pvt Ltd",
    "symbol": "OPTIMUS.NS",
    "type": "stock"
  },
  {
    "name": "Syngene International Ltd",
    "symbol": "SYNGENE.NS",
    "type": "stock"
  },
  {
    "name": "Divi's Nutraceuticals Ltd",
    "symbol": "DIVISNUTR.NS",
    "type": "stock"
  },
  {
    "name": "Aarti Drugs Ltd",
    "symbol": "AARTIDRUGS.NS",
    "type": "stock"
  },
  {
    "name": "S&S Power Switchgear Ltd",
    "symbol": "SNSPOWER.NS",
    "type": "stock"
  },
  {
    "name": "Genus Power Infrastructures Ltd",
    "symbol": "GENUSPOWER.NS",
    "type": "stock"
  },
  {
    "name": "Secure Meters Ltd",
    "symbol": "SECUREMTR.NS",
    "type": "stock"
  },
  {
    "name": "Itron India Ltd",
    "symbol": "ITRON.NS",
    "type": "stock"
  },
  {
    "name": "Apraava Energy Pvt Ltd",
    "symbol": "APRAAVA.NS",
    "type": "stock"
  },
  {
    "name": "Greenko Energies Pvt Ltd",
    "symbol": "GREENKOENE.NS",
    "type": "stock"
  },
  {
    "name": "Hero Future Energies Pvt Ltd",
    "symbol": "HEROFE.NS",
    "type": "stock"
  },
  {
    "name": "CleanMax Enviro Energy Solutions",
    "symbol": "CLEANMAX.NS",
    "type": "stock"
  },
  {
    "name": "SunSource Energy Pvt Ltd",
    "symbol": "SUNSOURCE.NS",
    "type": "stock"
  },
  {
    "name": "Fourth Partner Energy Pvt Ltd",
    "symbol": "FOURTHPART.NS",
    "type": "stock"
  },
  {
    "name": "Sprng Energy Pvt Ltd",
    "symbol": "SPRNG.NS",
    "type": "stock"
  },
  {
    "name": "Avaada Energy Pvt Ltd",
    "symbol": "AVAADA.NS",
    "type": "stock"
  },
  {
    "name": "Torrent Renewables Pvt Ltd",
    "symbol": "TORNTREN.NS",
    "type": "stock"
  },
  {
    "name": "Amp Energy India Pvt Ltd",
    "symbol": "AMPENERGY.NS",
    "type": "stock"
  },
  {
    "name": "Continuum Wind Energy Ltd",
    "symbol": "CONTINUUM.NS",
    "type": "stock"
  },
  {
    "name": "Orange Renewable Power Pvt Ltd",
    "symbol": "ORANGE.NS",
    "type": "stock"
  },
  {
    "name": "Ayana Renewable Power Pvt Ltd",
    "symbol": "AYANA.NS",
    "type": "stock"
  },
  {
    "name": "O2 Power Pvt Ltd",
    "symbol": "O2POWER.NS",
    "type": "stock"
  },
  {
    "name": "Amp Solar Pvt Ltd",
    "symbol": "AMPSOLAR.NS",
    "type": "stock"
  },
  {
    "name": "Mahindra Susten Pvt Ltd",
    "symbol": "MAHINDRASU.NS",
    "type": "stock"
  },
  {
    "name": "SoftBank Energy India Pvt Ltd",
    "symbol": "SOFTBANKIND.NS",
    "type": "stock"
  },
  {
    "name": "Tata Power Renewable Energy Ltd",
    "symbol": "TPREL.NS",
    "type": "stock"
  },
  {
    "name": "Adani Solar Ltd",
    "symbol": "ADANISOL.NS",
    "type": "stock"
  },
  {
    "name": "Waaree Solar Ltd",
    "symbol": "WAAREESOL.NS",
    "type": "stock"
  },
  {
    "name": "Goldi Solar Pvt Ltd",
    "symbol": "GOLDISOL.NS",
    "type": "stock"
  },
  {
    "name": "Saatvik Solar Pvt Ltd",
    "symbol": "SAATVIK.NS",
    "type": "stock"
  },
  {
    "name": "Renewsys India Pvt Ltd",
    "symbol": "RENEWSYS.NS",
    "type": "stock"
  },
  {
    "name": "Jupiter Solar Power Ltd",
    "symbol": "JUPSIOLAR.NS",
    "type": "stock"
  },
  {
    "name": "Sunew Solar Ltd",
    "symbol": "SUNEWSOL.NS",
    "type": "stock"
  },
  {
    "name": "Rays Power Infra Pvt Ltd",
    "symbol": "RAYSPOWER.NS",
    "type": "stock"
  },
  {
    "name": "Marengo Asia Hospitals Ltd",
    "symbol": "MARENGO.NS",
    "type": "stock"
  },
  {
    "name": "Paras Healthcare Pvt Ltd",
    "symbol": "PARASHEALTH.NS",
    "type": "stock"
  },
  {
    "name": "HM Hospitals & Diagnostics Ltd",
    "symbol": "HMHOSPITL.NS",
    "type": "stock"
  },
  {
    "name": "Prime Healthtech Ltd",
    "symbol": "PRIMEHLTH.NS",
    "type": "stock"
  },
  {
    "name": "Ozone Ayurvedics Ltd",
    "symbol": "OZONEAYURV.NS",
    "type": "stock"
  },
  {
    "name": "Kerala Ayurveda Ltd",
    "symbol": "KERALAAYUR.NS",
    "type": "stock"
  },
  {
    "name": "Hamdard Laboratories India Ltd",
    "symbol": "HAMDARD.NS",
    "type": "stock"
  },
  {
    "name": "Dabur Pharma Ltd",
    "symbol": "DABURPHARMA.NS",
    "type": "stock"
  },
  {
    "name": "Baidyanath Ayurved Bhawan Ltd",
    "symbol": "BAIDYANATH.NS",
    "type": "stock"
  },
  {
    "name": "Emami Healthcare Ltd",
    "symbol": "EMAMIHLTH.NS",
    "type": "stock"
  },
  {
    "name": "Zandu Realty Ltd",
    "symbol": "ZANDU.NS",
    "type": "stock"
  },
  {
    "name": "Patanjali Ayurved Ltd",
    "symbol": "PATANJALI.NS",
    "type": "stock"
  },
  {
    "name": "Himalaya Drug Company",
    "symbol": "HIMALAYA.NS",
    "type": "stock"
  },
  {
    "name": "Vicco Laboratories Pvt Ltd",
    "symbol": "VICCO.NS",
    "type": "stock"
  },
  {
    "name": "Biotique Pvt Ltd",
    "symbol": "BIOTIQUE.NS",
    "type": "stock"
  },
  {
    "name": "Forest Essentials Pvt Ltd",
    "symbol": "FORESTESS.NS",
    "type": "stock"
  },
  {
    "name": "Kama Ayurveda Ltd",
    "symbol": "KAMA.NS",
    "type": "stock"
  },
  {
    "name": "Kapiva Ayurveda Ltd",
    "symbol": "KAPIVA.NS",
    "type": "stock"
  },
  {
    "name": "The Ayurveda Co Pvt Ltd",
    "symbol": "TAC.NS",
    "type": "stock"
  },
  {
    "name": "Vedix Pvt Ltd",
    "symbol": "VEDIX.NS",
    "type": "stock"
  },
  {
    "name": "WOW Skin Science Pvt Ltd",
    "symbol": "WOW.NS",
    "type": "stock"
  },
  {
    "name": "Mamaearth (Honasa Consumer Ltd)",
    "symbol": "HONASA.NS",
    "type": "stock"
  },
  {
    "name": "The Derma Co Pvt Ltd",
    "symbol": "DERMACO.NS",
    "type": "stock"
  },
  {
    "name": "Minimalist Skincare Pvt Ltd",
    "symbol": "MINIMALIST.NS",
    "type": "stock"
  },
  {
    "name": "Plum (Pureplay Skin Sciences)",
    "symbol": "PLUM.NS",
    "type": "stock"
  },
  {
    "name": "Sugar Cosmetics Ltd",
    "symbol": "SUGAR.NS",
    "type": "stock"
  },
  {
    "name": "Colorbar Cosmetics Pvt Ltd",
    "symbol": "COLORBAR.NS",
    "type": "stock"
  },
  {
    "name": "Lakme Lever Ltd",
    "symbol": "LAKME.NS",
    "type": "stock"
  },
  {
    "name": "Lotus Herbals Pvt Ltd",
    "symbol": "LOTUS.NS",
    "type": "stock"
  },
  {
    "name": "VLCC Health Care Ltd",
    "symbol": "VLCC.NS",
    "type": "stock"
  },
  {
    "name": "Naturals Beauty Supply Ltd",
    "symbol": "NATURALS.NS",
    "type": "stock"
  },
  {
    "name": "Jawed Habib Hair & Beauty Ltd",
    "symbol": "JAWEDHABIB.NS",
    "type": "stock"
  },
  {
    "name": "Enrich Salons & Academy Ltd",
    "symbol": "ENRICH.NS",
    "type": "stock"
  },
  {
    "name": "Green Trends Hair & Style Ltd",
    "symbol": "GREENTREND.NS",
    "type": "stock"
  },
  {
    "name": "Wella India Pvt Ltd",
    "symbol": "WELLA.NS",
    "type": "stock"
  },
  {
    "name": "Loreal India Pvt Ltd",
    "symbol": "LOREAL.NS",
    "type": "stock"
  },
  {
    "name": "Schwarzkopf India Ltd",
    "symbol": "SCHWARZKOP.NS",
    "type": "stock"
  },
  {
    "name": "Henkel India Ltd",
    "symbol": "HENKEL.NS",
    "type": "stock"
  },
  {
    "name": "Reckitt Benckiser (India) Ltd",
    "symbol": "RECKITT.NS",
    "type": "stock"
  },
  {
    "name": "Kimberly-Clark India Pvt Ltd",
    "symbol": "KIMBERLY.NS",
    "type": "stock"
  },
  {
    "name": "Johnson & Johnson India Ltd",
    "symbol": "JNJIND.NS",
    "type": "stock"
  },
  {
    "name": "Bayer Healthcare Pvt Ltd",
    "symbol": "BAYERHLTH.NS",
    "type": "stock"
  },
  {
    "name": "Novartis Healthcare Pvt Ltd",
    "symbol": "NOVARTISH.NS",
    "type": "stock"
  },
  {
    "name": "Sanofi Healthcare India Pvt Ltd",
    "symbol": "SANOFIIND.NS",
    "type": "stock"
  },
  {
    "name": "Boehringer Ingelheim India Pvt Ltd",
    "symbol": "BOEHRINGER.NS",
    "type": "stock"
  },
  {
    "name": "AstraZeneca Pharma India Ltd",
    "symbol": "ASTRAZEN.NS",
    "type": "stock"
  },
  {
    "name": "MSD Pharmaceuticals Pvt Ltd",
    "symbol": "MSDPHARMA.NS",
    "type": "stock"
  },
  {
    "name": "Eli Lilly India Pvt Ltd",
    "symbol": "ELILILLY.NS",
    "type": "stock"
  },
  {
    "name": "UCB India Pvt Ltd",
    "symbol": "UCB.NS",
    "type": "stock"
  },
  {
    "name": "Servier India Pvt Ltd",
    "symbol": "SERVIER.NS",
    "type": "stock"
  },
  {
    "name": "Baxter India Pvt Ltd",
    "symbol": "BAXTER.NS",
    "type": "stock"
  },
  {
    "name": "Becton Dickinson India Pvt Ltd",
    "symbol": "BECTON.NS",
    "type": "stock"
  },
  {
    "name": "Medtronic India Pvt Ltd",
    "symbol": "MEDTRONIC.NS",
    "type": "stock"
  },
  {
    "name": "Abbott Laboratories India Ltd",
    "symbol": "ABBOTTLABS.NS",
    "type": "stock"
  },
  {
    "name": "Fresenius Kabi India Pvt Ltd",
    "symbol": "FRESENIUS.NS",
    "type": "stock"
  },
  {
    "name": "B. Braun Medical India Pvt Ltd",
    "symbol": "BBRAUN.NS",
    "type": "stock"
  },
  {
    "name": "Nipro India Corporation Ltd",
    "symbol": "NIPRO.NS",
    "type": "stock"
  },
  {
    "name": "Narang Medical Ltd",
    "symbol": "NARANGMED.NS",
    "type": "stock"
  },
  {
    "name": "Triveni Turbine Ltd",
    "symbol": "TRIVENIENT.NS",
    "type": "stock"
  },
  {
    "name": "Elecon Engineering Co Ltd",
    "symbol": "ELECON.NS",
    "type": "stock"
  },
  {
    "name": "AIA Engineering Ltd",
    "symbol": "AIAENG.NS",
    "type": "stock"
  },
  {
    "name": "Tata Advanced Materials Ltd",
    "symbol": "TATAAML.NS",
    "type": "stock"
  },
  {
    "name": "Gujarat Pipavav Port Ltd",
    "symbol": "GPPL.NS",
    "type": "stock"
  },
  {
    "name": "Adani Ports Mundra Ltd",
    "symbol": "ADANIPORT.NS",
    "type": "stock"
  },
  {
    "name": "JSW Infrastructure Ltd",
    "symbol": "JSWINFRA.NS",
    "type": "stock"
  },
  {
    "name": "Navkar Corporation Ltd",
    "symbol": "NAVKARCORP.NS",
    "type": "stock"
  },
  {
    "name": "Allcargo Terminals Ltd",
    "symbol": "ALLCARGOTM.NS",
    "type": "stock"
  },
  {
    "name": "Avana Logistek Ltd",
    "symbol": "AVANA.NS",
    "type": "stock"
  },
  {
    "name": "Tiger Logistics (India) Ltd",
    "symbol": "TIGER.NS",
    "type": "stock"
  },
  {
    "name": "TVS Supply Chain Solutions Ltd",
    "symbol": "TVSSCS.NS",
    "type": "stock"
  },
  {
    "name": "Safexpress Pvt Ltd",
    "symbol": "SAFEXPRESS.NS",
    "type": "stock"
  },
  {
    "name": "Rivigo Services Pvt Ltd",
    "symbol": "RIVIGO.NS",
    "type": "stock"
  },
  {
    "name": "Blackbuck (Zinka Logistics)",
    "symbol": "BLACKBUCK.NS",
    "type": "stock"
  },
  {
    "name": "FarEye Pvt Ltd",
    "symbol": "FAREYE.NS",
    "type": "stock"
  },
  {
    "name": "Locus Systems Pvt Ltd",
    "symbol": "LOCUS.NS",
    "type": "stock"
  },
  {
    "name": "LogiNext Solutions Pvt Ltd",
    "symbol": "LOGINEXT.NS",
    "type": "stock"
  },
  {
    "name": "Shipyaari Pvt Ltd",
    "symbol": "SHIPYAARI.NS",
    "type": "stock"
  },
  {
    "name": "Vamaship Pvt Ltd",
    "symbol": "VAMASHIP.NS",
    "type": "stock"
  },
  {
    "name": "EcomExpress Pvt Ltd",
    "symbol": "ECOMEXPR.NS",
    "type": "stock"
  },
  {
    "name": "Xpressbees Logistics Pvt Ltd",
    "symbol": "XPRESSBEES.NS",
    "type": "stock"
  },
  {
    "name": "Shadowfax Technologies Pvt Ltd",
    "symbol": "SHADOWFAX.NS",
    "type": "stock"
  },
  {
    "name": "Porter (Dhruv Loadways Pvt Ltd)",
    "symbol": "PORTER.NS",
    "type": "stock"
  },
  {
    "name": "WheelsEye Technology Pvt Ltd",
    "symbol": "WHEELSYE.NS",
    "type": "stock"
  },
  {
    "name": "Zypp Electric Pvt Ltd",
    "symbol": "ZYPP.NS",
    "type": "stock"
  },
  {
    "name": "Yulu Bikes Pvt Ltd",
    "symbol": "YULU.NS",
    "type": "stock"
  },
  {
    "name": "Affle (India) Ltd",
    "symbol": "AFFLE.NS",
    "type": "stock"
  },
  {
    "name": "InMobi Pte Ltd",
    "symbol": "INMOBI.NS",
    "type": "stock"
  },
  {
    "name": "Glance (InMobi)",
    "symbol": "GLANCE.NS",
    "type": "stock"
  },
  {
    "name": "Flipkart Internet Pvt Ltd",
    "symbol": "FLIPKART.NS",
    "type": "stock"
  },
  {
    "name": "Meesho (Fashnear Technologies)",
    "symbol": "MEESHO.NS",
    "type": "stock"
  },
  {
    "name": "Snapdeal Ltd",
    "symbol": "SNAPDEAL.NS",
    "type": "stock"
  },
  {
    "name": "Myntra Designs Pvt Ltd",
    "symbol": "MYNTRA.NS",
    "type": "stock"
  },
  {
    "name": "Ajio (Reliance)",
    "symbol": "AJIO.NS",
    "type": "stock"
  },
  {
    "name": "Nykaa Fashion Ltd",
    "symbol": "NYKFASH.NS",
    "type": "stock"
  },
  {
    "name": "Purplle (Manash Lifestyle Pvt Ltd)",
    "symbol": "PURPLLE.NS",
    "type": "stock"
  },
  {
    "name": "Limeroad (Lime Road Retail Pvt)",
    "symbol": "LIMEROAD.NS",
    "type": "stock"
  },
  {
    "name": "Craftsvilla.com Pvt Ltd",
    "symbol": "CRAFTSVIL.NS",
    "type": "stock"
  },
  {
    "name": "Aza Fashions Pvt Ltd",
    "symbol": "AZAFASH.NS",
    "type": "stock"
  },
  {
    "name": "Global Desi (ABFRL)",
    "symbol": "GLOBALDESI.NS",
    "type": "stock"
  },
  {
    "name": "Reliance Trends (Reliance Retail)",
    "symbol": "RELTRENDS.NS",
    "type": "stock"
  },
  {
    "name": "Westside (Trent Ltd)",
    "symbol": "WESTSIDE.NS",
    "type": "stock"
  },
  {
    "name": "Pantaloons (ABFRL)",
    "symbol": "PANTALOON.NS",
    "type": "stock"
  },
  {
    "name": "Lifestyle International Pvt Ltd",
    "symbol": "LIFESTYLE.NS",
    "type": "stock"
  },
  {
    "name": "Max Fashion (Landmark Group)",
    "symbol": "MAXFASH.NS",
    "type": "stock"
  },
  {
    "name": "Zudio (Trent)",
    "symbol": "ZUDIO.NS",
    "type": "stock"
  },
  {
    "name": "FabIndia Ltd",
    "symbol": "FABINDIA.NS",
    "type": "stock"
  },
  {
    "name": "Ethnix by Raymond",
    "symbol": "ETHNIX.NS",
    "type": "stock"
  },
  {
    "name": "Manyavar (Vedant Fashions Ltd)",
    "symbol": "MANYAVAR.NS",
    "type": "stock"
  },
  {
    "name": "Biba Apparels Pvt Ltd",
    "symbol": "BIBA.NS",
    "type": "stock"
  },
  {
    "name": "W (TCNS Clothing)",
    "symbol": "WCLOTHING.NS",
    "type": "stock"
  },
  {
    "name": "Aurelia (TCNS Clothing)",
    "symbol": "AURELIA.NS",
    "type": "stock"
  },
  {
    "name": "Global Colours Ltd",
    "symbol": "GLOBALCOL.NS",
    "type": "stock"
  },
  {
    "name": "Soch Apparels Pvt Ltd",
    "symbol": "SOCH.NS",
    "type": "stock"
  },
  {
    "name": "Anouk (Myntra)",
    "symbol": "ANOUK.NS",
    "type": "stock"
  },
  {
    "name": "AND (Anita Dongre)",
    "symbol": "ANITADONG.NS",
    "type": "stock"
  },
  {
    "name": "House of Anita Dongre Ltd",
    "symbol": "HOAD.NS",
    "type": "stock"
  },
  {
    "name": "Masaba Gupta Ltd",
    "symbol": "MASABA.NS",
    "type": "stock"
  },
  {
    "name": "Sabyasachi Mukherjee Couture",
    "symbol": "SABYASACH.NS",
    "type": "stock"
  },
  {
    "name": "Manish Malhotra Ltd",
    "symbol": "MANISHMAL.NS",
    "type": "stock"
  },
  {
    "name": "Tarun Tahiliani Pvt Ltd",
    "symbol": "TARUNTAHI.NS",
    "type": "stock"
  },
  {
    "name": "Ritu Kumar Pvt Ltd",
    "symbol": "RITUKUMAR.NS",
    "type": "stock"
  },
  {
    "name": "Wendell Rodricks Design Space",
    "symbol": "WENDELL.NS",
    "type": "stock"
  },
  {
    "name": "Abraham & Thakore Ltd",
    "symbol": "ABRAHAMTH.NS",
    "type": "stock"
  },
  {
    "name": "Rohit Bal Designs Pvt Ltd",
    "symbol": "ROHITBAL.NS",
    "type": "stock"
  },
  {
    "name": "JJ Valaya Couture",
    "symbol": "JJVALAYA.NS",
    "type": "stock"
  },
  {
    "name": "Gaurav Gupta Ltd",
    "symbol": "GAURAVG.NS",
    "type": "stock"
  },
  {
    "name": "Anamika Khanna Pvt Ltd",
    "symbol": "ANAMIKA.NS",
    "type": "stock"
  },
  {
    "name": "Shantanu & Nikhil Pvt Ltd",
    "symbol": "SHANTNIK.NS",
    "type": "stock"
  },
  {
    "name": "Ranna Gill Ltd",
    "symbol": "RANNAGILL.NS",
    "type": "stock"
  },
  {
    "name": "Nikhil Thampi Pvt Ltd",
    "symbol": "NIKHILTHAM.NS",
    "type": "stock"
  },
  {
    "name": "Payal Singhal Pvt Ltd",
    "symbol": "PAYALSING.NS",
    "type": "stock"
  },
  {
    "name": "Ridhi Mehra Pvt Ltd",
    "symbol": "RIDHIMEH.NS",
    "type": "stock"
  },
  {
    "name": "Monisha Jaising Pvt Ltd",
    "symbol": "MONISHAJAI.NS",
    "type": "stock"
  },
  {
    "name": "Rocky Star Ltd",
    "symbol": "ROCKYSTAR.NS",
    "type": "stock"
  },
  {
    "name": "Rajesh Pratap Singh Ltd",
    "symbol": "RAJESHPRAT.NS",
    "type": "stock"
  },
  {
    "name": "Suneet Varma Pvt Ltd",
    "symbol": "SUNEETVAR.NS",
    "type": "stock"
  },
  {
    "name": "Pankaj & Nidhi Pvt Ltd",
    "symbol": "PANKAJNID.NS",
    "type": "stock"
  },
  {
    "name": "Swapnil Shinde Ltd",
    "symbol": "SWAPNILSH.NS",
    "type": "stock"
  },
  {
    "name": "Gauri & Nainika Pvt Ltd",
    "symbol": "GAURINAIN.NS",
    "type": "stock"
  },
  {
    "name": "Neeta Lulla Ltd",
    "symbol": "NEETALUL.NS",
    "type": "stock"
  },
  {
    "name": "Vikram Phadnis Ltd",
    "symbol": "VIKRAMPHADNIS.NS",
    "type": "stock"
  },
  {
    "name": "Pallavi Mohan Ltd",
    "symbol": "PALLAVIMON.NS",
    "type": "stock"
  },
  {
    "name": "Namrata Joshipura Ltd",
    "symbol": "NAMRATAJOSH.NS",
    "type": "stock"
  },
  {
    "name": "Bhairavi Jaikishan Ltd",
    "symbol": "BHAIRAVIJAI.NS",
    "type": "stock"
  },
  {
    "name": "Faraz Manan Ltd",
    "symbol": "FARAZMANAN.NS",
    "type": "stock"
  },
  {
    "name": "Dolly J Ltd",
    "symbol": "DOLLYJ.NS",
    "type": "stock"
  },
  {
    "name": "Rahul Mishra Pvt Ltd",
    "symbol": "RAHULMISHRA.NS",
    "type": "stock"
  },
  {
    "name": "Rina Dhaka Ltd",
    "symbol": "RINADHAKA.NS",
    "type": "stock"
  },
  {
    "name": "Rina Dhaka Pvt Ltd",
    "symbol": "RINADHAKAPL.NS",
    "type": "stock"
  },
  {
    "name": "Swaati Nirupam Ltd",
    "symbol": "SWAATINIR.NS",
    "type": "stock"
  },
  {
    "name": "Kotwara Ltd",
    "symbol": "KOTWARA.NS",
    "type": "stock"
  },
  {
    "name": "Ritu Beri Pvt Ltd",
    "symbol": "RITUBERI.NS",
    "type": "stock"
  },
  {
    "name": "Manoviraj Khosla Ltd",
    "symbol": "MANOVIRAJ.NS",
    "type": "stock"
  },
  {
    "name": "Malini Ramani Ltd",
    "symbol": "MALINIRAMAN.NS",
    "type": "stock"
  },
  {
    "name": "Sushma Patel Ltd",
    "symbol": "SUSHMAPATEL.NS",
    "type": "stock"
  },
  {
    "name": "Rabani & Rakha Pvt Ltd",
    "symbol": "RABANIRAK.NS",
    "type": "stock"
  },
  {
    "name": "SVA (Sonam & Paras Modi)",
    "symbol": "SVA.NS",
    "type": "stock"
  },
  {
    "name": "AM:PM (Ankita & Priyanka Modi)",
    "symbol": "AMPM.NS",
    "type": "stock"
  },
  {
    "name": "Shivan & Narresh Ltd",
    "symbol": "SHIVANNAR.NS",
    "type": "stock"
  },
  {
    "name": "Pankaj & Nidhi Couture",
    "symbol": "PANKAJNIDC.NS",
    "type": "stock"
  },
  {
    "name": "Falguni Shane Peacock Ltd",
    "symbol": "FALGUNISHP.NS",
    "type": "stock"
  },
  {
    "name": "Hemant Trevedi Ltd",
    "symbol": "HEMANTTREV.NS",
    "type": "stock"
  },
  {
    "name": "Shriya Som Ltd",
    "symbol": "SHRIYASOM.NS",
    "type": "stock"
  },
  {
    "name": "Nachiket Barve Ltd",
    "symbol": "NACHIKETB.NS",
    "type": "stock"
  },
  {
    "name": "Kiran Uttam Ghosh Ltd",
    "symbol": "KIRANUTTAM.NS",
    "type": "stock"
  },
  {
    "name": "Varun Bahl Pvt Ltd",
    "symbol": "VARUNBAHL.NS",
    "type": "stock"
  },
  {
    "name": "Anushree Reddy Ltd",
    "symbol": "ANUSHREERED.NS",
    "type": "stock"
  },
  {
    "name": "Payal Khandwala Ltd",
    "symbol": "PAYALKHAN.NS",
    "type": "stock"
  },
  {
    "name": "Aakanksha Singh Ltd",
    "symbol": "AAKANKSHA.NS",
    "type": "stock"
  },
  {
    "name": "Rena Passos Ltd",
    "symbol": "RENAPASSOS.NS",
    "type": "stock"
  },
  {
    "name": "Ohaila Khan Ltd",
    "symbol": "OHAILAKHAN.NS",
    "type": "stock"
  },
  {
    "name": "Megha & Jigar Ltd",
    "symbol": "MEGHAJIGAR.NS",
    "type": "stock"
  },
  {
    "name": "Siddartha Tytler Ltd",
    "symbol": "SIDDARTHAT.NS",
    "type": "stock"
  },
  {
    "name": "Archana Kochhar Ltd",
    "symbol": "ARCHANAKOC.NS",
    "type": "stock"
  },
  {
    "name": "Debarun Mukherjee Ltd",
    "symbol": "DEBARUNMUK.NS",
    "type": "stock"
  },
  {
    "name": "Siddhartha Banerjee Ltd",
    "symbol": "SIDDBANERJEE.NS",
    "type": "stock"
  },
  {
    "name": "Swati Vijaivargie Ltd",
    "symbol": "SWATIVIJ.NS",
    "type": "stock"
  },
  {
    "name": "Vineet Bahl Ltd",
    "symbol": "VINEETBAHL.NS",
    "type": "stock"
  },
  {
    "name": "Gaurang Shah Ltd",
    "symbol": "GAURANGSHAH.NS",
    "type": "stock"
  },
  {
    "name": "Ashdeen Lilaowala Ltd",
    "symbol": "ASHDEEN.NS",
    "type": "stock"
  },
  {
    "name": "Ekaya Banaras Ltd",
    "symbol": "EKAYA.NS",
    "type": "stock"
  },
  {
    "name": "Raw Mango Pvt Ltd",
    "symbol": "RAWMANGO.NS",
    "type": "stock"
  },
  {
    "name": "Nifty BeES",
    "symbol": "NIFTYBEES.NS",
    "type": "mutual_fund"
  },
  {
    "name": "Junior BeES",
    "symbol": "JUNIORBEES.NS",
    "type": "mutual_fund"
  },
  {
    "name": "Gold BeES",
    "symbol": "GOLDBEES.NS",
    "type": "mutual_fund"
  },
  {
    "name": "Bank BeES",
    "symbol": "BANKBEES.NS",
    "type": "mutual_fund"
  },
  {
    "name": "IT BeES",
    "symbol": "ITBEES.NS",
    "type": "mutual_fund"
  },
  {
    "name": "Bitcoin",
    "symbol": "BTC-USD",
    "type": "crypto"
  },
  {
    "name": "Ethereum",
    "symbol": "ETH-USD",
    "type": "crypto"
  },
  {
    "name": "BNB",
    "symbol": "BNB-USD",
    "type": "crypto"
  },
  {
    "name": "Solana",
    "symbol": "SOL-USD",
    "type": "crypto"
  },
  {
    "name": "XRP",
    "symbol": "XRP-USD",
    "type": "crypto"
  },
  {
    "name": "Gold",
    "symbol": "GC=F",
    "type": "gold"
  },
  {
    "name": "Nifty 50",
    "symbol": "^NSEI",
    "type": "other"
  },
  {
    "name": "Sensex",
    "symbol": "^BSESN",
    "type": "other"
  }
];