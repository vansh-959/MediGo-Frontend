(() => {
  const translations = {
    en: {
      langLabel: "Language", emergency: "Emergency", heroEyebrow: "Healthcare discovery",
      heroTitle: "Find the right hospital", heroDescription: "Search by disease, city, symptoms or budget.",
      searchPlaceholder: "e.g. cancer, kidney stone, chest pain", cityPlaceholder: "City (optional)",
      search: "Search", hospitalsShown: "Allow location or enter a city for nearest hospitals", useLocation: "Use my location",
      cancer: "Cancer", kidneyStone: "Kidney stone", heart: "Heart", bone: "Bone",
      reportTitle: "Smart Medical Report Reader", reportDescription: "Upload a clear prescription or lab report image to extract key terms and find hospitals for the relevant department.",
      reportUpload: "Choose report image", reportFileHint: "JPEG, PNG or WebP · max 8 MB", analyzeReport: "Analyze report",
      reportDisclaimer: "AI can misread medical documents. Results are for information only and are not a diagnosis. Confirm findings with a qualified healthcare professional. Images are sent to Google Gemini for analysis and are not stored by MediGo.",
      reportAnalyzing: "Analyzing…", reportWorking: "Reading the report and matching departments…", reportDone: "Analysis complete. Please verify the extracted information.",
      reportImageType: "Choose a JPEG, PNG, or WebP image.", reportImageLarge: "The image is larger than 8 MB. Choose a smaller image.",
      reportCouldNotReach: "Could not reach the report analysis service. Check your connection and try again.", reportTimeout: "Analysis took too long. Try a clearer or smaller image.",
      possibleCondition: "Possible condition", recommendedDepartment: "Recommended department", summary: "Summary", extractedKeywords: "Extracted keywords", priority: "Priority",
      reportHospitalHeading: "Hospitals with matching services", noKeywords: "No clear keywords could be extracted.", noHospitals: "No matching hospitals were found for this department and location.",
      reportResultDisclaimer: "AI may misread a report. Confirm all findings with a qualified healthcare professional.", directions: "Directions", call: "Call",
      costTitle: "Government Scheme & Cost Estimator", costDescription: "Compare an indicative private cost with a scheme package-rate reference and find local hospitals.",
      procedure: "Procedure", chooseProcedure: "Choose procedure", city: "City", chooseCity: "Choose city", beneficiary: "I am a scheme beneficiary",
      beneficiaryHint: "Select PM-JAY or CGHS to view a package-rate reference.", scheme: "Scheme", chooseScheme: "Choose a scheme", estimateCosts: "Estimate costs", preparingEstimate: "Preparing estimate and matching hospitals…",
      estimateReady: "Estimate ready. Confirm package details and eligibility with a listed hospital.", cityChoicesError: "Could not load cities. Check your connection and refresh the page.",
      estimateFailed: "Could not prepare this estimate. Check the selected procedure and city, then try again.",
      privateRange: "Indicative private range", schemeRate: "Scheme package-rate reference", noScheme: "Select a scheme", privateMidpoint: "Private midpoint", schemeReference: "Scheme package reference",
      relevantHospitals: "Relevant hospitals", listedHospitals: "listed hospitals", noCostHospitals: "No matching hospital is listed in this city. Try a nearby city or contact the scheme helpdesk.",
      costDisclaimer: "Estimates are illustrative, not official rates or guaranteed savings. Confirm eligibility and package details with the hospital or scheme helpdesk.",
      navSearch: "Search", navMap: "Map", navCompare: "Compare", navReport: "Report", navChat: "Ask AI",
      chatTitle: "Ask MediGo AI", chatSubtitle: "Health information and hospital discovery", chatWelcome: "Ask a question in English, हिन्दी, Hinglish or ਪੰਜਾਬੀ. For a medical emergency, call 112 or ambulance 108 in India.",
      chatPlaceholder: "Ask a question", chatMicLabel: "Speak your question", chatVoiceUnavailable: "Voice input is not supported in this browser.", chatVoiceDenied: "Allow microphone access to use voice input.", chatThinking: "MediGo AI is preparing an answer…", chatUnavailable: "MediGo AI is unavailable. Check the Gemini API key and connection, then try again.",
      chatTimeout: "MediGo AI is taking too long to respond. Please try again.", chatBackend: "I can’t reach the MediGo server. Check that the backend is running and try again.",
      directoryMatches: "MediGo directory matches", availabilityNotLive: "Availability not live",
      sosButton: "EMERGENCY SOS", sosTitle: "Emergency SOS", sosCancel: "Cancel alert", close: "Close", call108: "Call 108",
      sosGettingLocation: "Getting your location. Alert will be sent in {seconds} seconds.", sosSending: "Sending your location to emergency support…",
      sosNoGps: "GPS is not available. Call 108 for ambulance assistance.", sosPermission: "Location permission was denied. Call 108; SOS could not be sent without your location.",
      sosGpsTimeout: "Could not get GPS location in time. Call 108 now.", sosNetworkError: "Could not send the SOS location. Call 108 now if this is an emergency.",
      sosEmailSent: "Location alert email sent. Call 108 to request ambulance assistance.", sosEmailFailed: "Location was received, but the alert email was not sent. Call 108 now.",
      filterAll: "All hospitals", filterSaved: "♥ Saved", filterEmergency: "24/7 emergency", filterAyushman: "Ayushman", filterIcu: "ICU beds",
      mapTitle: "Hospital map", resultsTitle: "Recommended hospitals", sortBest: "Best match", sortNearest: "Nearest", sortLowest: "Lowest cost", sortRating: "Top rated",
      noLiveDispatch: "MediGo does not confirm ambulance dispatch. Call 108 for ambulance assistance.",
      copyCoordinates: "Copy coordinates", copied: "Copied", copyUnavailable: "Copy unavailable · read coordinates to 108", requestTime: "Request time", nearestListedHospital: "Nearest listed emergency hospital",
      kneeReplacement: "Knee Replacement", bypassSurgery: "Bypass Surgery (CABG)", dialysis: "Hemodialysis (per session)", appendectomy: "Appendectomy",
      home: "Home", ambulance: "Ambulance", allEmergency: "All emergencies", loadingTrauma: "Loading listed emergency hospitals…", noEmergencyHospitals: "No emergency hospitals are listed. Call 108 for help.", hospitalLoadError: "Could not load hospitals. Check the connection or call 108.", selectHospital: "Select a hospital…", emergencyUnit: "Emergency unit", emergencyBeds: "emergency beds", icuBedsLabel: "ICU beds", available: "available", nearestGps: "Sorted by distance from your GPS location", gpsPermissionDenied: "Allow location access in browser settings, then tap GPS again.", gpsPositionUnavailable: "Could not detect your location. Check that device Location Services are on.", gpsTimeout: "Location request timed out. Check GPS and tap refresh again.", gpsSecureContextRequired: "GPS requires HTTPS. Open this page on HTTPS or localhost.", availabilityUnconfirmed: "Emergency availability not confirmed · call first", nearbyTraumaHeading: "Nearby Hospitals", noNearbyHospitalsFallback: "No hospital was found within 50 km. Showing the closest MediGo listed options; call to confirm they can receive you.", mapOnlyHospitalNotice: "This hospital was found on the map. Emergency reception and MediGo email alert are not verified.", call108Notice: "For urgent ambulance help in India, call 108 now.", select: "Select", directoryHospitalFallbackLabel: "Listed hospital · confirm emergency care", directoryHospitalFallbackHeading: "Nearby listed hospitals", directoryHospitalFallbackNote: "No hospitals are marked with emergency availability right now. Showing listed hospitals; call to confirm they can receive you. For immediate help, call 108 or 112.",
      emergencyPageSubtitle: "Emergency support", callAction: "Call", allCall: "CALL",
    },
    hi: {
      langLabel: "भाषा", emergency: "आपातकाल", heroEyebrow: "स्वास्थ्य सेवा खोज", heroTitle: "सही अस्पताल खोजें", heroDescription: "बीमारी, शहर, लक्षण या बजट से खोजें।",
      searchPlaceholder: "जैसे: कैंसर, किडनी स्टोन, सीने में दर्द", cityPlaceholder: "शहर (वैकल्पिक)", search: "खोजें", hospitalsShown: "नज़दीकी अस्पतालों के लिए लोकेशन दें या शहर लिखें", useLocation: "मेरी लोकेशन इस्तेमाल करें",
      cancer: "कैंसर", kidneyStone: "किडनी स्टोन", heart: "हृदय", bone: "हड्डी",
      reportTitle: "मेडिकल रिपोर्ट रीडर", reportDescription: "मुख्य जानकारी निकालने और संबंधित विभाग के अस्पताल खोजने के लिए साफ़ प्रिस्क्रिप्शन या लैब रिपोर्ट की तस्वीर अपलोड करें।",
      reportUpload: "रिपोर्ट की तस्वीर चुनें", reportFileHint: "JPEG, PNG या WebP · अधिकतम 8 MB", analyzeReport: "रिपोर्ट का विश्लेषण करें",
      reportDisclaimer: "AI मेडिकल दस्तावेज़ गलत पढ़ सकता है। यह जानकारी निदान नहीं है। निष्कर्ष डॉक्टर से सत्यापित करें। तस्वीर विश्लेषण के लिए Google Gemini को भेजी जाती है और MediGo में सेव नहीं होती।",
      reportAnalyzing: "विश्लेषण हो रहा है…", reportWorking: "रिपोर्ट पढ़कर संबंधित विभाग खोज रहे हैं…", reportDone: "विश्लेषण पूरा हुआ। निकाली गई जानकारी सत्यापित करें।",
      reportImageType: "JPEG, PNG या WebP तस्वीर चुनें।", reportImageLarge: "तस्वीर 8 MB से बड़ी है। छोटी तस्वीर चुनें।",
      reportCouldNotReach: "रिपोर्ट विश्लेषण सेवा से संपर्क नहीं हो सका। इंटरनेट जाँचकर फिर कोशिश करें।", reportTimeout: "विश्लेषण में अधिक समय लगा। साफ़ या छोटी तस्वीर आज़माएँ।",
      possibleCondition: "संभावित स्थिति", recommendedDepartment: "सुझाया गया विभाग", summary: "सारांश", extractedKeywords: "निकाले गए मुख्य शब्द", priority: "प्राथमिकता",
      reportHospitalHeading: "इस विभाग की सेवाओं वाले अस्पताल", noKeywords: "स्पष्ट मुख्य शब्द नहीं मिले।", noHospitals: "इस विभाग और लोकेशन के लिए अस्पताल नहीं मिले।",
      reportResultDisclaimer: "AI रिपोर्ट को गलत पढ़ सकता है। निष्कर्ष किसी योग्य डॉक्टर से सत्यापित करें।", directions: "रास्ता", call: "कॉल करें",
      costTitle: "सरकारी योजना और लागत अनुमान", costDescription: "निजी अस्पताल की अनुमानित लागत और योजना पैकेज दर की तुलना करें।",
      procedure: "प्रक्रिया", chooseProcedure: "प्रक्रिया चुनें", city: "शहर", chooseCity: "शहर चुनें", beneficiary: "मैं योजना का लाभार्थी हूँ",
      beneficiaryHint: "पैकेज दर देखने के लिए PM-JAY या CGHS चुनें।", scheme: "योजना", chooseScheme: "योजना चुनें", estimateCosts: "लागत का अनुमान", preparingEstimate: "अनुमान और अस्पताल सूची तैयार हो रही है…",
      estimateReady: "अनुमान तैयार है। अस्पताल से पैकेज और पात्रता की पुष्टि करें।", cityChoicesError: "शहरों की सूची लोड नहीं हुई। इंटरनेट जाँचकर पेज रीफ़्रेश करें।",
      estimateFailed: "अनुमान तैयार नहीं हुआ। चुनी गई प्रक्रिया और शहर जाँचकर फिर कोशिश करें।",
      privateRange: "निजी अस्पताल की अनुमानित लागत", schemeRate: "योजना पैकेज दर संदर्भ", noScheme: "योजना चुनें", privateMidpoint: "निजी लागत का मध्य", schemeReference: "योजना पैकेज संदर्भ",
      relevantHospitals: "संबंधित अस्पताल", listedHospitals: "सूचीबद्ध अस्पताल", noCostHospitals: "इस शहर में मेल खाता अस्पताल सूचीबद्ध नहीं है। पास का शहर आज़माएँ या योजना हेल्पलाइन से पूछें।",
      costDisclaimer: "ये केवल अनुमान हैं, आधिकारिक दर या पक्की बचत नहीं। पात्रता और पैकेज की पुष्टि अस्पताल या योजना हेल्पलाइन से करें।",
      navSearch: "खोज", navMap: "मानचित्र", navCompare: "तुलना", navReport: "रिपोर्ट", navChat: "AI से पूछें",
      chatTitle: "MediGo AI से पूछें", chatSubtitle: "स्वास्थ्य जानकारी और अस्पताल खोज", chatWelcome: "हिंदी, Hinglish, English या पंजाबी में सवाल पूछें। भारत में मेडिकल आपातकाल हो तो 112 या एम्बुलेंस के लिए 108 पर कॉल करें।",
      chatPlaceholder: "अपना सवाल पूछें", chatMicLabel: "बोलकर सवाल पूछें", chatVoiceUnavailable: "इस ब्राउज़र में voice input उपलब्ध नहीं है।", chatVoiceDenied: "Voice input के लिए microphone की अनुमति दें।", chatThinking: "MediGo AI जवाब तैयार कर रहा है…", chatUnavailable: "MediGo AI उपलब्ध नहीं है। Gemini API key और इंटरनेट जाँचकर फिर कोशिश करें।",
      chatTimeout: "जवाब आने में अधिक समय लगा। फिर कोशिश करें।", chatBackend: "MediGo सर्वर से संपर्क नहीं हुआ। बैकएंड चालू है या नहीं जाँचें।",
      directoryMatches: "MediGo डायरेक्टरी के अस्पताल", availabilityNotLive: "उपलब्धता लाइव नहीं है",
      sosButton: "आपातकालीन SOS", sosTitle: "आपातकालीन SOS", sosCancel: "अलर्ट रद्द करें", close: "बंद करें", call108: "108 पर कॉल करें",
      sosGettingLocation: "लोकेशन ली जा रही है। अलर्ट {seconds} सेकंड में भेजा जाएगा।", sosSending: "आपकी लोकेशन आपातकालीन सहायता को भेज रहे हैं…",
      sosNoGps: "इस ब्राउज़र में GPS उपलब्ध नहीं है। एम्बुलेंस के लिए 108 पर कॉल करें।", sosPermission: "लोकेशन अनुमति नहीं मिली। SOS नहीं भेजा गया; 108 पर कॉल करें।",
      sosGpsTimeout: "समय पर GPS लोकेशन नहीं मिली। अभी 108 पर कॉल करें।", sosNetworkError: "SOS लोकेशन नहीं भेज सके। आपातकाल हो तो अभी 108 पर कॉल करें।",
      sosEmailSent: "लोकेशन अलर्ट ईमेल भेजा गया। एम्बुलेंस के लिए 108 पर कॉल करें।", sosEmailFailed: "लोकेशन मिली, लेकिन ईमेल अलर्ट नहीं गया। अभी 108 पर कॉल करें।",
      filterAll: "सभी अस्पताल", filterSaved: "♥ सेव किए", filterEmergency: "24/7 आपातकाल", filterAyushman: "आयुष्मान", filterIcu: "ICU बेड",
      mapTitle: "अस्पताल का मानचित्र", resultsTitle: "सुझाए गए अस्पताल", sortBest: "सबसे अच्छा मेल", sortNearest: "सबसे नज़दीक", sortLowest: "सबसे कम लागत", sortRating: "सबसे अच्छी रेटिंग",
      noLiveDispatch: "MediGo एम्बुलेंस भेजे जाने की पुष्टि नहीं करता। एम्बुलेंस के लिए 108 पर कॉल करें।",
      copyCoordinates: "लोकेशन कॉपी करें", copied: "कॉपी हो गया", copyUnavailable: "कॉपी नहीं हुआ · निर्देशांक 108 को बताएं", requestTime: "अनुरोध का समय", nearestListedHospital: "सूची में नज़दीकी आपातकालीन अस्पताल",
      kneeReplacement: "घुटना बदलना", bypassSurgery: "बायपास सर्जरी (CABG)", dialysis: "हीमोडायलिसिस (प्रति सत्र)", appendectomy: "अपेंडिक्स का ऑपरेशन",
      home: "होम", ambulance: "एम्बुलेंस", allEmergency: "सभी आपातकाल", loadingTrauma: "सूचीबद्ध आपातकालीन अस्पताल लोड हो रहे हैं…", noEmergencyHospitals: "आपातकालीन अस्पताल सूची में नहीं हैं। मदद के लिए 108 पर कॉल करें।", hospitalLoadError: "अस्पताल लोड नहीं हुए। इंटरनेट जाँचें या 108 पर कॉल करें।", selectHospital: "अस्पताल चुनें…", emergencyUnit: "आपातकालीन विभाग", emergencyBeds: "आपातकालीन बेड", icuBedsLabel: "ICU बेड", available: "उपलब्ध", nearestGps: "आपकी GPS लोकेशन से दूरी के अनुसार", gpsPermissionDenied: "ब्राउज़र सेटिंग में लोकेशन की अनुमति दें, फिर GPS दोबारा दबाएँ।", gpsPositionUnavailable: "लोकेशन नहीं मिली। डिवाइस की Location Services चालू करें।", gpsTimeout: "लोकेशन मिलने में देर हुई। GPS जाँचकर फिर कोशिश करें।", gpsSecureContextRequired: "GPS के लिए HTTPS या localhost पर पेज खोलें।", availabilityUnconfirmed: "आपातकालीन उपलब्धता की पुष्टि नहीं · पहले कॉल करें", nearbyTraumaHeading: "नज़दीकी अस्पताल", noNearbyHospitalsFallback: "50 किमी के भीतर अस्पताल नहीं मिला। सबसे नज़दीकी MediGo सूची वाले विकल्प दिखाए हैं; आने से पहले कॉल करके पुष्टि करें।", mapOnlyHospitalNotice: "यह अस्पताल मैप से मिला है। इसकी आपातकालीन सेवा और MediGo ईमेल अलर्ट की पुष्टि नहीं हुई है।", call108Notice: "एम्बुलेंस सहायता के लिए अभी 108 पर कॉल करें।", select: "चुनें", directoryHospitalFallbackLabel: "सूचीबद्ध अस्पताल · आपातकालीन सेवा की पुष्टि करें", directoryHospitalFallbackHeading: "नज़दीकी सूचीबद्ध अस्पताल", directoryHospitalFallbackNote: "अभी किसी अस्पताल की आपातकालीन उपलब्धता सूचीबद्ध नहीं है। सूची के अस्पताल दिखाए जा रहे हैं; जाने से पहले फोन करके पुष्टि करें। तुरंत मदद के लिए 108 या 112 पर कॉल करें।",
      emergencyPageSubtitle: "आपातकालीन सहायता", callAction: "कॉल करें", allCall: "कॉल",
    },
    "hi-Latn": {
      langLabel: "Bhasha", emergency: "Emergency", heroEyebrow: "Sehat seva khoj", heroTitle: "Sahi hospital khojein", heroDescription: "Bimari, shehar, lakshan ya budget se khojein.",
      searchPlaceholder: "Jaise: cancer, kidney stone, seene mein dard", cityPlaceholder: "Shehar (optional)", search: "Khojein", hospitalsShown: "Paas ke hospitals ke liye location allow karein ya shehar likhein", useLocation: "Meri location use karein",
      cancer: "Cancer", kidneyStone: "Kidney stone", heart: "Dil", bone: "Haddi",
      reportTitle: "Medical report reader", reportDescription: "Zaroori jaankari aur sambandhit department ke hospitals dhoondhne ke liye saaf prescription ya lab report ki photo upload karein.",
      reportUpload: "Report ki photo chunein", reportFileHint: "JPEG, PNG ya WebP · max 8 MB", analyzeReport: "Report analyze karein",
      reportDisclaimer: "AI medical document galat padh sakta hai. Yeh diagnosis nahi hai. Nateeje doctor se verify karein. Photo analysis ke liye Google Gemini ko bheji jaati hai aur MediGo mein save nahi hoti.",
      reportAnalyzing: "Analysis ho raha hai…", reportWorking: "Report padhkar sambandhit department dhoondh rahe hain…", reportDone: "Analysis poora. Nikali gayi jaankari verify karein.",
      reportImageType: "JPEG, PNG ya WebP photo chunein.", reportImageLarge: "Photo 8 MB se badi hai. Chhoti photo chunein.", reportCouldNotReach: "Report analysis service se connect nahi hua. Internet check karke phir try karein.", reportTimeout: "Analysis mein zyada samay laga. Saaf ya chhoti photo try karein.",
      possibleCondition: "Mumkin sthiti", recommendedDepartment: "Sujhaya gaya department", summary: "Summary", extractedKeywords: "Nikle hue main shabd", priority: "Priority",
      reportHospitalHeading: "Is department ki seva wale hospitals", noKeywords: "Saaf keywords nahi mile.", noHospitals: "Is department aur location ke liye hospital nahi mile.", reportResultDisclaimer: "AI report galat padh sakta hai. Nateeje doctor se verify karein.", directions: "Raasta", call: "Call karein",
      costTitle: "Sarkari yojana aur cost estimate", costDescription: "Private hospital ke andazee kharche aur yojana package rate ki tulna karein.",
      procedure: "Procedure", chooseProcedure: "Procedure chunein", city: "Shehar", chooseCity: "Shehar chunein", beneficiary: "Main yojana ka beneficiary hoon", beneficiaryHint: "Package rate dekhne ke liye PM-JAY ya CGHS chunein.", scheme: "Yojana", chooseScheme: "Yojana chunein", estimateCosts: "Cost estimate karein",
      preparingEstimate: "Estimate aur hospitals taiyar ho rahe hain…", estimateReady: "Estimate taiyar hai. Hospital se package aur eligibility confirm karein.", cityChoicesError: "Shehar list load nahi hui. Internet check karke page refresh karein.",
      estimateFailed: "Estimate nahi ban saka. Procedure aur shehar check karke phir try karein.",
      privateRange: "Private hospital ka andazee kharcha", schemeRate: "Yojana package rate", noScheme: "Yojana chunein", privateMidpoint: "Private cost ka beech ka andaza", schemeReference: "Yojana package rate",
      relevantHospitals: "Sambandhit hospitals", listedHospitals: "listed hospitals", noCostHospitals: "Is shehar mein matching hospital listed nahi hai. Paas ka shehar ya scheme helpdesk try karein.", costDisclaimer: "Yeh sirf andaze hain, official rate ya pakki bachat nahi. Eligibility aur package hospital ya scheme helpdesk se confirm karein.",
      navSearch: "Khoj", navMap: "Map", navCompare: "Tulna", navReport: "Report", navChat: "AI se poochein",
      chatTitle: "MediGo AI se poochein", chatSubtitle: "Sehat ki jaankari aur hospital khoj", chatWelcome: "Hindi, Hinglish, English ya Punjabi mein sawaal poochein. India mein emergency ho to 112 ya ambulance ke liye 108 call karein.",
      chatPlaceholder: "Apna sawaal bolkar poochein", chatMicLabel: "Sawaal bolkar poochein", chatVoiceUnavailable: "Is browser mein voice input available nahi hai.", chatVoiceDenied: "Voice input ke liye microphone permission dein.", chatThinking: "MediGo AI jawab taiyar kar raha hai…", chatUnavailable: "MediGo AI abhi available nahi. Gemini API key aur internet check karke phir try karein.", chatTimeout: "Jawab mein zyada samay laga. Phir try karein.", chatBackend: "MediGo server se connect nahi hua. Backend chalu hai ya nahi check karein.",
      directoryMatches: "MediGo directory ke hospitals", availabilityNotLive: "Availability live nahi hai", sosButton: "EMERGENCY SOS", sosTitle: "Emergency SOS", sosCancel: "Alert cancel karein", close: "Band karein", call108: "108 call karein",
      sosGettingLocation: "Location mil rahi hai. Alert {seconds} second mein bheja jayega.", sosSending: "Aapki location emergency support ko bhej rahe hain…", sosNoGps: "Is browser mein GPS nahi hai. Ambulance ke liye 108 call karein.",
      sosPermission: "Location permission nahi mili. SOS nahi bheja gaya; 108 call karein.", sosGpsTimeout: "Samay par GPS location nahi mili. Abhi 108 call karein.", sosNetworkError: "SOS location nahi bhej sake. Emergency ho to 108 call karein.", sosEmailSent: "Location alert email bheja. Ambulance ke liye 108 call karein.", sosEmailFailed: "Location mili, par email alert nahi gaya. Abhi 108 call karein.",
      filterAll: "Sabhi hospitals", filterSaved: "♥ Saved", filterEmergency: "24/7 emergency", filterAyushman: "Ayushman", filterIcu: "ICU beds", mapTitle: "Hospital map", resultsTitle: "Sujhaye gaye hospitals", sortBest: "Best match", sortNearest: "Sabse paas", sortLowest: "Sabse kam cost", sortRating: "Top rated", noLiveDispatch: "MediGo ambulance dispatch confirm nahi karta. Ambulance ke liye 108 call karein.",
      copyCoordinates: "Coordinates copy karein", copied: "Copy ho gaya", copyUnavailable: "Copy nahi hua · coordinates 108 ko batayein", requestTime: "Request ka samay", nearestListedHospital: "List mein sabse paas emergency hospital",
      kneeReplacement: "Knee replacement", bypassSurgery: "Bypass surgery (CABG)", dialysis: "Hemodialysis (har session)", appendectomy: "Appendix surgery",
      home: "Home", ambulance: "Ambulance", allEmergency: "Sabhi emergency", loadingTrauma: "List ke emergency hospitals load ho rahe hain…", noEmergencyHospitals: "Emergency hospital list mein nahi. Madad ke liye 108 call karein.", hospitalLoadError: "Hospital load nahi hue. Internet check karein ya 108 call karein.", selectHospital: "Hospital chunein…", emergencyUnit: "Emergency unit", emergencyBeds: "emergency beds", icuBedsLabel: "ICU beds", available: "available", nearestGps: "Aapki GPS location se distance ke hisaab se", gpsPermissionDenied: "Browser settings mein location allow karein, phir GPS dobara dabayein.", gpsPositionUnavailable: "Location nahi mili. Device ki Location Services on karein.", gpsTimeout: "Location milne mein der hui. GPS check karke dobara try karein.", gpsSecureContextRequired: "GPS ke liye HTTPS ya localhost par page kholein.", availabilityUnconfirmed: "Emergency availability confirm nahi · pehle call karein", nearbyTraumaHeading: "Paas ke hospitals", noNearbyHospitalsFallback: "50 km ke andar hospital nahi mila. Sabse paas ke MediGo listed options dikhaye hain; jaane se pehle call karke confirm karein.", mapOnlyHospitalNotice: "Ye hospital map se mila hai. Iski emergency service aur MediGo email alert verify nahi hain.", call108Notice: "Ambulance help ke liye abhi 108 call karein.", select: "Chunein", directoryHospitalFallbackLabel: "Listed hospital · emergency confirm karein", directoryHospitalFallbackHeading: "Paas ke listed hospitals", directoryHospitalFallbackNote: "Abhi kisi hospital ki emergency availability listed nahi hai. Listed hospitals dikh rahe hain; jaane se pehle phone karke confirm karein. Turant madad ke liye 108 ya 112 call karein.",
      emergencyPageSubtitle: "Emergency support", callAction: "Call", allCall: "CALL",
    },
    pa: {
      langLabel: "ਭਾਸ਼ਾ", emergency: "ਐਮਰਜੈਂਸੀ", heroEyebrow: "ਸਿਹਤ ਸੇਵਾ ਖੋਜ", heroTitle: "ਸਹੀ ਹਸਪਤਾਲ ਲੱਭੋ", heroDescription: "ਬਿਮਾਰੀ, ਸ਼ਹਿਰ, ਲੱਛਣ ਜਾਂ ਬਜਟ ਨਾਲ ਖੋਜੋ।",
      searchPlaceholder: "ਜਿਵੇਂ: ਕੈਂਸਰ, ਗੁਰਦੇ ਦੀ ਪੱਥਰੀ, ਛਾਤੀ ਵਿੱਚ ਦਰਦ", cityPlaceholder: "ਸ਼ਹਿਰ (ਵਿਕਲਪਿਕ)", search: "ਖੋਜੋ", hospitalsShown: "ਨੇੜਲੇ ਹਸਪਤਾਲਾਂ ਲਈ ਲੋਕੇਸ਼ਨ ਦਿਓ ਜਾਂ ਸ਼ਹਿਰ ਲਿਖੋ", useLocation: "ਮੇਰੀ ਲੋਕੇਸ਼ਨ ਵਰਤੋ",
      cancer: "ਕੈਂਸਰ", kidneyStone: "ਗੁਰਦੇ ਦੀ ਪੱਥਰੀ", heart: "ਦਿਲ", bone: "ਹੱਡੀ",
      reportTitle: "ਮੈਡੀਕਲ ਰਿਪੋਰਟ ਰੀਡਰ", reportDescription: "ਮੁੱਖ ਜਾਣਕਾਰੀ ਕੱਢਣ ਅਤੇ ਸੰਬੰਧਿਤ ਵਿਭਾਗ ਦੇ ਹਸਪਤਾਲ ਲੱਭਣ ਲਈ ਸਾਫ਼ ਪਰਚੀ ਜਾਂ ਲੈਬ ਰਿਪੋਰਟ ਦੀ ਤਸਵੀਰ ਅੱਪਲੋਡ ਕਰੋ।",
      reportUpload: "ਰਿਪੋਰਟ ਦੀ ਤਸਵੀਰ ਚੁਣੋ", reportFileHint: "JPEG, PNG ਜਾਂ WebP · ਵੱਧ ਤੋਂ ਵੱਧ 8 MB", analyzeReport: "ਰਿਪੋਰਟ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ",
      reportDisclaimer: "AI ਮੈਡੀਕਲ ਦਸਤਾਵੇਜ਼ ਗਲਤ ਪੜ੍ਹ ਸਕਦਾ ਹੈ। ਇਹ ਜਾਣਕਾਰੀ ਨਿਦਾਨ ਨਹੀਂ ਹੈ। ਨਤੀਜੇ ਡਾਕਟਰ ਤੋਂ ਪੱਕੇ ਕਰੋ। ਤਸਵੀਰ Google Gemini ਨੂੰ ਭੇਜੀ ਜਾਂਦੀ ਹੈ ਅਤੇ MediGo ਵਿੱਚ ਸੰਭਾਲੀ ਨਹੀਂ ਜਾਂਦੀ।",
      reportAnalyzing: "ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ…", reportWorking: "ਰਿਪੋਰਟ ਪੜ੍ਹ ਕੇ ਵਿਭਾਗ ਲੱਭ ਰਹੇ ਹਾਂ…", reportDone: "ਵਿਸ਼ਲੇਸ਼ਣ ਪੂਰਾ। ਕੱਢੀ ਜਾਣਕਾਰੀ ਦੀ ਜਾਂਚ ਕਰੋ।",
      reportImageType: "JPEG, PNG ਜਾਂ WebP ਤਸਵੀਰ ਚੁਣੋ।", reportImageLarge: "ਤਸਵੀਰ 8 MB ਤੋਂ ਵੱਡੀ ਹੈ। ਛੋਟੀ ਤਸਵੀਰ ਚੁਣੋ।", reportCouldNotReach: "ਰਿਪੋਰਟ ਸੇਵਾ ਨਾਲ ਸੰਪਰਕ ਨਹੀਂ ਹੋਇਆ। ਇੰਟਰਨੈੱਟ ਜਾਂਚ ਕੇ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।", reportTimeout: "ਵਿਸ਼ਲੇਸ਼ਣ ਵਿੱਚ ਵੱਧ ਸਮਾਂ ਲੱਗਾ। ਸਾਫ਼ ਜਾਂ ਛੋਟੀ ਤਸਵੀਰ ਅਜ਼ਮਾਓ।",
      possibleCondition: "ਸੰਭਾਵੀ ਹਾਲਤ", recommendedDepartment: "ਸੁਝਾਇਆ ਵਿਭਾਗ", summary: "ਸਾਰ", extractedKeywords: "ਕੱਢੇ ਮੁੱਖ ਸ਼ਬਦ", priority: "ਤਰਜੀਹ", reportHospitalHeading: "ਇਸ ਵਿਭਾਗ ਦੀਆਂ ਸੇਵਾਵਾਂ ਵਾਲੇ ਹਸਪਤਾਲ", noKeywords: "ਸਪਸ਼ਟ ਮੁੱਖ ਸ਼ਬਦ ਨਹੀਂ ਮਿਲੇ।", noHospitals: "ਇਸ ਵਿਭਾਗ ਅਤੇ ਲੋਕੇਸ਼ਨ ਲਈ ਹਸਪਤਾਲ ਨਹੀਂ ਮਿਲੇ।", reportResultDisclaimer: "AI ਰਿਪੋਰਟ ਗਲਤ ਪੜ੍ਹ ਸਕਦਾ ਹੈ। ਨਤੀਜੇ ਯੋਗ ਡਾਕਟਰ ਤੋਂ ਪੱਕੇ ਕਰੋ।", directions: "ਰਸਤਾ", call: "ਕਾਲ ਕਰੋ",
      costTitle: "ਸਰਕਾਰੀ ਯੋਜਨਾ ਅਤੇ ਲਾਗਤ ਅੰਦਾਜ਼ਾ", costDescription: "ਨਿੱਜੀ ਹਸਪਤਾਲ ਦੇ ਅੰਦਾਜ਼ੇ ਖਰਚੇ ਅਤੇ ਯੋਜਨਾ ਪੈਕੇਜ ਦਰ ਦੀ ਤੁਲਨਾ ਕਰੋ।", procedure: "ਇਲਾਜ", chooseProcedure: "ਇਲਾਜ ਚੁਣੋ", city: "ਸ਼ਹਿਰ", chooseCity: "ਸ਼ਹਿਰ ਚੁਣੋ", beneficiary: "ਮੈਂ ਯੋਜਨਾ ਦਾ ਲਾਭਪਾਤਰੀ ਹਾਂ", beneficiaryHint: "ਪੈਕੇਜ ਦਰ ਲਈ PM-JAY ਜਾਂ CGHS ਚੁਣੋ।", scheme: "ਯੋਜਨਾ", chooseScheme: "ਯੋਜਨਾ ਚੁਣੋ", estimateCosts: "ਲਾਗਤ ਦਾ ਅੰਦਾਜ਼ਾ", preparingEstimate: "ਅੰਦਾਜ਼ਾ ਅਤੇ ਹਸਪਤਾਲ ਤਿਆਰ ਹੋ ਰਹੇ ਹਨ…", estimateReady: "ਅੰਦਾਜ਼ਾ ਤਿਆਰ ਹੈ। ਹਸਪਤਾਲ ਤੋਂ ਪੈਕੇਜ ਅਤੇ ਯੋਗਤਾ ਪੱਕੀ ਕਰੋ।", cityChoicesError: "ਸ਼ਹਿਰਾਂ ਦੀ ਸੂਚੀ ਨਹੀਂ ਲੋਡ ਹੋਈ। ਇੰਟਰਨੈੱਟ ਜਾਂਚ ਕੇ ਪੰਨਾ ਮੁੜ ਖੋਲ੍ਹੋ।",
      estimateFailed: "ਅੰਦਾਜ਼ਾ ਨਹੀਂ ਬਣਿਆ। ਚੁਣਿਆ ਇਲਾਜ ਅਤੇ ਸ਼ਹਿਰ ਜਾਂਚ ਕੇ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
      privateRange: "ਨਿੱਜੀ ਹਸਪਤਾਲ ਦਾ ਅੰਦਾਜ਼ੀ ਖਰਚਾ", schemeRate: "ਯੋਜਨਾ ਪੈਕੇਜ ਦਰ", noScheme: "ਯੋਜਨਾ ਚੁਣੋ", privateMidpoint: "ਨਿੱਜੀ ਖਰਚੇ ਦਾ ਵਿਚਕਾਰਲਾ ਅੰਦਾਜ਼ਾ", schemeReference: "ਯੋਜਨਾ ਪੈਕੇਜ ਸੰਦਰਭ", relevantHospitals: "ਸੰਬੰਧਿਤ ਹਸਪਤਾਲ", listedHospitals: "ਸੂਚੀਬੱਧ ਹਸਪਤਾਲ", noCostHospitals: "ਇਸ ਸ਼ਹਿਰ ਵਿੱਚ ਮੇਲ ਖਾਂਦਾ ਹਸਪਤਾਲ ਸੂਚੀਬੱਧ ਨਹੀਂ। ਨੇੜਲਾ ਸ਼ਹਿਰ ਜਾਂ ਯੋਜਨਾ ਹੈਲਪਡੈਸਕ ਅਜ਼ਮਾਓ।", costDisclaimer: "ਇਹ ਸਿਰਫ਼ ਅੰਦਾਜ਼ੇ ਹਨ, ਸਰਕਾਰੀ ਦਰ ਜਾਂ ਪੱਕੀ ਬਚਤ ਨਹੀਂ। ਯੋਗਤਾ ਅਤੇ ਪੈਕੇਜ ਹਸਪਤਾਲ ਜਾਂ ਯੋਜਨਾ ਹੈਲਪਡੈਸਕ ਤੋਂ ਪੱਕੇ ਕਰੋ।",
      navSearch: "ਖੋਜ", navMap: "ਨਕਸ਼ਾ", navCompare: "ਤੁਲਨਾ", navReport: "ਰਿਪੋਰਟ", navChat: "AI ਪੁੱਛੋ", chatTitle: "MediGo AI ਨੂੰ ਪੁੱਛੋ", chatSubtitle: "ਸਿਹਤ ਜਾਣਕਾਰੀ ਅਤੇ ਹਸਪਤਾਲ ਖੋਜ", chatWelcome: "ਪੰਜਾਬੀ, ਹਿੰਦੀ, Hinglish ਜਾਂ English ਵਿੱਚ ਸਵਾਲ ਪੁੱਛੋ। ਭਾਰਤ ਵਿੱਚ ਐਮਰਜੈਂਸੀ ਹੋਵੇ ਤਾਂ 112 ਜਾਂ ਐਂਬੂਲੈਂਸ ਲਈ 108 ਤੇ ਕਾਲ ਕਰੋ।",
      chatPlaceholder: "ਆਪਣਾ ਸਵਾਲ ਪੁੱਛੋ", chatMicLabel: "ਆਪਣਾ ਸਵਾਲ ਬੋਲੋ", chatVoiceUnavailable: "ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ voice input ਉਪਲਬਧ ਨਹੀਂ ਹੈ।", chatVoiceDenied: "Voice input ਲਈ microphone ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ।", chatThinking: "MediGo AI ਜਵਾਬ ਤਿਆਰ ਕਰ ਰਿਹਾ ਹੈ…", chatUnavailable: "MediGo AI ਉਪਲਬਧ ਨਹੀਂ। Gemini API key ਅਤੇ ਇੰਟਰਨੈੱਟ ਜਾਂਚ ਕੇ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।", chatTimeout: "ਜਵਾਬ ਵਿੱਚ ਵੱਧ ਸਮਾਂ ਲੱਗ ਰਿਹਾ ਹੈ। ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।", chatBackend: "MediGo ਸਰਵਰ ਨਾਲ ਸੰਪਰਕ ਨਹੀਂ ਹੋਇਆ। ਬੈਕਐਂਡ ਚਾਲੂ ਹੈ ਜਾਂ ਨਹੀਂ ਜਾਂਚੋ।", directoryMatches: "MediGo ਡਾਇਰੈਕਟਰੀ ਦੇ ਹਸਪਤਾਲ", availabilityNotLive: "ਮੌਜੂਦਾ ਉਪਲਬਧਤਾ ਨਹੀਂ",
      sosButton: "ਐਮਰਜੈਂਸੀ SOS", sosTitle: "ਐਮਰਜੈਂਸੀ SOS", sosCancel: "ਅਲਰਟ ਰੱਦ ਕਰੋ", close: "ਬੰਦ ਕਰੋ", call108: "108 ਤੇ ਕਾਲ ਕਰੋ", sosGettingLocation: "ਲੋਕੇਸ਼ਨ ਲਈ ਜਾ ਰਹੀ ਹੈ। ਅਲਰਟ {seconds} ਸਕਿੰਟਾਂ ਵਿੱਚ ਭੇਜਿਆ ਜਾਵੇਗਾ।", sosSending: "ਤੁਹਾਡੀ ਲੋਕੇਸ਼ਨ ਐਮਰਜੈਂਸੀ ਸਹਾਇਤਾ ਨੂੰ ਭੇਜ ਰਹੇ ਹਾਂ…", sosNoGps: "ਇਸ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ GPS ਨਹੀਂ। ਐਂਬੂਲੈਂਸ ਲਈ 108 ਤੇ ਕਾਲ ਕਰੋ।", sosPermission: "ਲੋਕੇਸ਼ਨ ਦੀ ਇਜਾਜ਼ਤ ਨਹੀਂ ਮਿਲੀ। SOS ਨਹੀਂ ਭੇਜਿਆ; 108 ਤੇ ਕਾਲ ਕਰੋ।", sosGpsTimeout: "ਸਮੇਂ ਸਿਰ GPS ਲੋਕੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ। ਹੁਣੇ 108 ਤੇ ਕਾਲ ਕਰੋ।", sosNetworkError: "SOS ਲੋਕੇਸ਼ਨ ਨਹੀਂ ਭੇਜ ਸਕੇ। ਐਮਰਜੈਂਸੀ ਹੋਵੇ ਤਾਂ 108 ਤੇ ਕਾਲ ਕਰੋ।", sosEmailSent: "ਲੋਕੇਸ਼ਨ ਅਲਰਟ ਈਮੇਲ ਭੇਜੀ। ਐਂਬੂਲੈਂਸ ਲਈ 108 ਤੇ ਕਾਲ ਕਰੋ।", sosEmailFailed: "ਲੋਕੇਸ਼ਨ ਮਿਲੀ, ਪਰ ਈਮੇਲ ਅਲਰਟ ਨਹੀਂ ਗਿਆ। ਹੁਣੇ 108 ਤੇ ਕਾਲ ਕਰੋ।",
      filterAll: "ਸਾਰੇ ਹਸਪਤਾਲ", filterSaved: "♥ ਸੰਭਾਲੇ", filterEmergency: "24/7 ਐਮਰਜੈਂਸੀ", filterAyushman: "ਆਯੁਸ਼ਮਾਨ", filterIcu: "ICU ਬੈੱਡ", mapTitle: "ਹਸਪਤਾਲ ਨਕਸ਼ਾ", resultsTitle: "ਸੁਝਾਏ ਹਸਪਤਾਲ", sortBest: "ਸਭ ਤੋਂ ਵਧੀਆ ਮੇਲ", sortNearest: "ਸਭ ਤੋਂ ਨੇੜੇ", sortLowest: "ਸਭ ਤੋਂ ਘੱਟ ਖਰਚਾ", sortRating: "ਚੰਗੀ ਰੇਟਿੰਗ", noLiveDispatch: "MediGo ਐਂਬੂਲੈਂਸ ਭੇਜਣ ਦੀ ਪੁਸ਼ਟੀ ਨਹੀਂ ਕਰਦਾ। ਐਂਬੂਲੈਂਸ ਲਈ 108 ਤੇ ਕਾਲ ਕਰੋ।",
      copyCoordinates: "ਕੋਆਰਡੀਨੇਟ ਕਾਪੀ ਕਰੋ", copied: "ਕਾਪੀ ਹੋ ਗਿਆ", copyUnavailable: "ਕਾਪੀ ਨਹੀਂ ਹੋਇਆ · ਕੋਆਰਡੀਨੇਟ 108 ਨੂੰ ਦੱਸੋ", requestTime: "ਬੇਨਤੀ ਦਾ ਸਮਾਂ", nearestListedHospital: "ਸੂਚੀ ਵਿੱਚ ਨੇੜਲਾ ਐਮਰਜੈਂਸੀ ਹਸਪਤਾਲ",
      kneeReplacement: "ਗੋਡਾ ਬਦਲਣ ਦੀ ਸਰਜਰੀ", bypassSurgery: "ਬਾਈਪਾਸ ਸਰਜਰੀ (CABG)", dialysis: "ਹੀਮੋਡਾਇਲਿਸਿਸ (ਹਰ ਸੈਸ਼ਨ)", appendectomy: "ਅਪੈਂਡਿਕਸ ਦਾ ਓਪਰੇਸ਼ਨ",
      home: "ਮੁੱਖ ਪੰਨਾ", ambulance: "ਐਂਬੂਲੈਂਸ", allEmergency: "ਸਾਰੀਆਂ ਐਮਰਜੈਂਸੀ", loadingTrauma: "ਸੂਚੀਬੱਧ ਐਮਰਜੈਂਸੀ ਹਸਪਤਾਲ ਲੋਡ ਹੋ ਰਹੇ ਹਨ…", noEmergencyHospitals: "ਐਮਰਜੈਂਸੀ ਹਸਪਤਾਲ ਸੂਚੀ ਵਿੱਚ ਨਹੀਂ। ਮਦਦ ਲਈ 108 ਤੇ ਕਾਲ ਕਰੋ।", hospitalLoadError: "ਹਸਪਤਾਲ ਨਹੀਂ ਲੋਡ ਹੋਏ। ਇੰਟਰਨੈੱਟ ਜਾਂਚੋ ਜਾਂ 108 ਤੇ ਕਾਲ ਕਰੋ।", selectHospital: "ਹਸਪਤਾਲ ਚੁਣੋ…", emergencyUnit: "ਐਮਰਜੈਂਸੀ ਵਿਭਾਗ", emergencyBeds: "ਐਮਰਜੈਂਸੀ ਬੈੱਡ", icuBedsLabel: "ICU ਬੈੱਡ", available: "ਉਪਲਬਧ", nearestGps: "ਤੁਹਾਡੀ GPS ਲੋਕੇਸ਼ਨ ਤੋਂ ਦੂਰੀ ਅਨੁਸਾਰ", gpsPermissionDenied: "ਬ੍ਰਾਊਜ਼ਰ ਸੈਟਿੰਗਾਂ ਵਿੱਚ ਲੋਕੇਸ਼ਨ ਦੀ ਇਜਾਜ਼ਤ ਦਿਓ, ਫਿਰ GPS ਦਬਾਓ।", gpsPositionUnavailable: "ਲੋਕੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ। ਡਿਵਾਈਸ ਦੀ Location Services ਚਾਲੂ ਕਰੋ।", gpsTimeout: "ਲੋਕੇਸ਼ਨ ਲੈਣ ਵਿੱਚ ਦੇਰ ਹੋਈ। GPS ਜਾਂਚ ਕੇ ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।", gpsSecureContextRequired: "GPS ਲਈ HTTPS ਜਾਂ localhost 'ਤੇ ਪੇਜ ਖੋਲ੍ਹੋ।", availabilityUnconfirmed: "ਐਮਰਜੈਂਸੀ ਉਪਲਬਧਤਾ ਦੀ ਪੁਸ਼ਟੀ ਨਹੀਂ · ਪਹਿਲਾਂ ਫ਼ੋਨ ਕਰੋ", nearbyTraumaHeading: "ਨੇੜਲੇ ਹਸਪਤਾਲ", noNearbyHospitalsFallback: "50 ਕਿਮੀ ਦੇ ਅੰਦਰ ਹਸਪਤਾਲ ਨਹੀਂ ਮਿਲਿਆ। ਸਭ ਤੋਂ ਨੇੜਲੇ MediGo ਸੂਚੀ ਵਾਲੇ ਵਿਕਲਪ ਦਿਖਾਏ ਹਨ; ਪਹਿਲਾਂ ਫ਼ੋਨ ਕਰਕੇ ਪੁਸ਼ਟੀ ਕਰੋ।", mapOnlyHospitalNotice: "ਇਹ ਹਸਪਤਾਲ ਨਕਸ਼ੇ ਤੋਂ ਮਿਲਿਆ ਹੈ। ਇਸ ਦੀ ਐਮਰਜੈਂਸੀ ਸੇਵਾ ਅਤੇ MediGo ਈਮੇਲ ਅਲਰਟ ਦੀ ਪੁਸ਼ਟੀ ਨਹੀਂ ਹੋਈ।", call108Notice: "ਐਂਬੂਲੈਂਸ ਮਦਦ ਲਈ ਹੁਣੇ 108 ਤੇ ਕਾਲ ਕਰੋ।", select: "ਚੁਣੋ", directoryHospitalFallbackLabel: "ਸੂਚੀਬੱਧ ਹਸਪਤਾਲ · ਐਮਰਜੈਂਸੀ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ", directoryHospitalFallbackHeading: "ਨੇੜਲੇ ਸੂਚੀਬੱਧ ਹਸਪਤਾਲ", directoryHospitalFallbackNote: "ਇਸ ਵੇਲੇ ਕਿਸੇ ਹਸਪਤਾਲ ਦੀ ਐਮਰਜੈਂਸੀ ਉਪਲਬਧਤਾ ਦਰਜ ਨਹੀਂ। ਸੂਚੀਬੱਧ ਹਸਪਤਾਲ ਦਿਖਾਏ ਹਨ; ਜਾਣ ਤੋਂ ਪਹਿਲਾਂ ਫ਼ੋਨ ਕਰਕੇ ਪੁਸ਼ਟੀ ਕਰੋ। ਤੁਰੰਤ ਮਦਦ ਲਈ 108 ਜਾਂ 112 ਤੇ ਕਾਲ ਕਰੋ।",
      emergencyPageSubtitle: "ਐਮਰਜੈਂਸੀ ਸਹਾਇਤਾ", callAction: "ਕਾਲ ਕਰੋ", allCall: "ਕਾਲ",
    },
  };

  // Labels used by UI controls that are rendered outside the original core
  // dictionary, plus document/accessibility text. Keep each locale complete.
  Object.assign(translations.en, {
    pageTitle: "MediGo | Find the right hospital", pageDescription: "Find hospitals by condition, location, and budget.",
    emergencyBannerTitle: "Emergency help · Call 108", emergencyBannerSubtitle: "No account needed",
    diseaseLabel: "Disease or symptom", voiceSearch: "Voice search",
    procedurePlaceholder: "Type or choose a procedure", procedureSuggestionHint: "You can type it or pick a suggestion.",
    costCityPlaceholder: "Type your city", citySuggestionHint: "Type a city; suggestions will appear.",
    searchUnderstood: "Search understood", conditionLabel: "Condition", specialistLabel: "Specialist", areaLabel: "Area",
    careGuidance: "Show care guidance", firstAidLabel: "First aid:", warningSignsLabel: "Warning signs:",
    sortHospitals: "Sort hospitals", compareSelected: "Compare selected", compareInstructions: "Tap Compare on at least 2 hospitals. Tap Save to keep a hospital in your Saved list.",
    searchEmpty: "Enter a symptom above to find matching hospitals. You can search without an account.",
    noSavedHospitals: "No saved hospitals yet", saveHospitalHint: "Tap Save on a hospital card to keep it here for later.",
    noFilteredHospitals: "No hospitals match the active filters", adjustFilters: "Try selecting All hospitals or adjusting your filters.",
    browseHospitals: "Browse hospitals", resetFilters: "Reset filters", compareTitle: "Compare hospitals",
    reportPreviewAlt: "Preview of selected medical report", nearYou: "Near you", drive: "drive", open24Hours: "Open 24 hours",
    icuBeds: "ICU beds", ready: "Ready", estimatedProcedure: "Est. procedure", outcome: "Outcome", rate: "Rate",
    verifiedProvider: "Verified provider with dedicated specialists.", save: "Save", saved: "Saved", removeSaved: "Remove from saved hospitals",
    compare: "Compare", added: "Added", review: "Review", share: "Share", call: "Call", map: "Map",
    tapCompare: "Click + Compare on a hospital card to see side-by-side metrics.", noHospitalsSelected: "No hospitals selected",
    mainTools: "Main tools", schemesListed: "Schemes listed in {city}", noSchemesListed: "No supported scheme is listed for this city. Try another city or call the hospital.", enterCitySchemes: "Enter your city to see local schemes.",
    emergencyConditionLabel: "Emergency condition / main problem", selectReceivingHospital: "Select receiving hospital *", refreshNearestGps: "Refresh nearest via GPS", conditionChest: "Severe chest pain / heart problem", conditionAccident: "Road accident / serious injury / heavy bleeding", conditionBreathing: "Difficulty breathing / choking", conditionStroke: "Possible stroke / face drooping / trouble speaking", conditionFever: "High fever / seizure", conditionPoison: "Poisoning / snake bite", conditionStomach: "Severe stomach pain", conditionOther: "Other emergency",
    localEmergencyFallbackNote: "The live hospital directory could not be reached. These listed hospitals are available for calling or navigation; current receiving availability is unconfirmed. Call 108 for ambulance dispatch.", localEmergencyFallbackHeading: "Showing listed emergency hospitals", gpsUnavailableAll: "GPS is unavailable · showing listed hospitals", locationUnavailableAll: "Location unavailable · showing listed hospitals", enableLocationToSort: "Allow location to sort hospitals by distance", sendingEmergencyAlert: "Sending emergency alert…",
  });
  Object.assign(translations.hi, {
    pageTitle: "MediGo | सही अस्पताल खोजें", pageDescription: "बीमारी, लोकेशन और बजट के अनुसार अस्पताल खोजें।",
    emergencyBannerTitle: "आपातकालीन सहायता · 108 पर कॉल करें", emergencyBannerSubtitle: "खाते की ज़रूरत नहीं",
    diseaseLabel: "बीमारी या लक्षण", voiceSearch: "बोलकर खोजें",
    procedurePlaceholder: "इलाज लिखें या चुनें", procedureSuggestionHint: "लिखें या सुझावों में से चुनें।",
    costCityPlaceholder: "अपना शहर लिखें", citySuggestionHint: "शहर लिखें; सुझाव दिखेंगे।",
    searchUnderstood: "खोज समझी गई", conditionLabel: "बीमारी", specialistLabel: "विशेषज्ञ", areaLabel: "इलाका",
    careGuidance: "देखभाल की सलाह देखें", firstAidLabel: "प्राथमिक उपचार:", warningSignsLabel: "चेतावनी के संकेत:",
    sortHospitals: "अस्पताल क्रमबद्ध करें", compareSelected: "चुने हुए अस्पतालों की तुलना करें", compareInstructions: "तुलना के लिए कम से कम 2 अस्पतालों पर Compare दबाएँ। Save दबाकर अस्पताल सहेजें।",
    searchEmpty: "मिलते-जुलते अस्पताल खोजने के लिए ऊपर लक्षण लिखें। बिना खाते के भी खोज सकते हैं।",
    noSavedHospitals: "अभी कोई अस्पताल सेव नहीं है", saveHospitalHint: "बाद में देखने के लिए अस्पताल कार्ड पर Save दबाएँ।",
    noFilteredHospitals: "चुने हुए फ़िल्टर में अस्पताल नहीं मिले", adjustFilters: "सभी अस्पताल चुनें या फ़िल्टर बदलकर देखें।",
    browseHospitals: "अस्पताल देखें", resetFilters: "फ़िल्टर रीसेट करें", compareTitle: "अस्पतालों की तुलना करें",
    reportPreviewAlt: "चुनी गई मेडिकल रिपोर्ट का प्रीव्यू", nearYou: "आपके पास", drive: "ड्राइव", open24Hours: "24 घंटे खुला",
    icuBeds: "ICU बेड", ready: "तैयार", estimatedProcedure: "अनुमानित प्रक्रिया लागत", outcome: "परिणाम", rate: "दर",
    verifiedProvider: "विशेषज्ञ डॉक्टरों वाला सत्यापित अस्पताल।", save: "सेव करें", saved: "सेव किया", removeSaved: "सेव किए अस्पतालों से हटाएँ",
    compare: "तुलना करें", added: "जोड़ा गया", review: "समीक्षा", share: "शेयर करें", call: "कॉल करें", map: "नक्शा",
    tapCompare: "अस्पतालों की तुलना के लिए कार्ड पर + Compare दबाएँ।", noHospitalsSelected: "कोई अस्पताल नहीं चुना गया",
    mainTools: "मुख्य विकल्प", schemesListed: "{city} में सूचीबद्ध योजनाएँ", noSchemesListed: "इस शहर में योजना सूचीबद्ध नहीं है। दूसरा शहर चुनें या अस्पताल को कॉल करें।", enterCitySchemes: "स्थानीय योजनाएँ देखने के लिए शहर लिखें।",
    emergencyConditionLabel: "आपातकाल की स्थिति / मुख्य समस्या", selectReceivingHospital: "मदद के लिए अस्पताल चुनें *", refreshNearestGps: "GPS से नज़दीकी अस्पताल ढूँढें", conditionChest: "तेज़ सीने में दर्द / दिल की समस्या", conditionAccident: "सड़क हादसा / गंभीर चोट / बहुत खून बहना", conditionBreathing: "साँस लेने में परेशानी / दम घुटना", conditionStroke: "स्ट्रोक के संकेत / चेहरा लटकना / बोलने में परेशानी", conditionFever: "तेज़ बुखार / दौरा", conditionPoison: "ज़हर / साँप का काटना", conditionStomach: "पेट में तेज़ दर्द", conditionOther: "अन्य आपातकाल",
    localEmergencyFallbackNote: "अस्पतालों की लाइव सूची नहीं खुली। ये सूचीबद्ध अस्पताल कॉल या रास्ते के लिए दिखाए गए हैं; अभी भर्ती की उपलब्धता की पुष्टि नहीं है। एम्बुलेंस के लिए 108 पर कॉल करें।", localEmergencyFallbackHeading: "सूचीबद्ध आपातकालीन अस्पताल दिखाए जा रहे हैं", gpsUnavailableAll: "GPS उपलब्ध नहीं · सूचीबद्ध अस्पताल दिख रहे हैं", locationUnavailableAll: "लोकेशन उपलब्ध नहीं · सूचीबद्ध अस्पताल दिख रहे हैं", enableLocationToSort: "दूरी से अस्पताल क्रमबद्ध करने के लिए लोकेशन दें", sendingEmergencyAlert: "आपातकालीन सूचना भेजी जा रही है…",
  });
  Object.assign(translations["hi-Latn"], {
    pageTitle: "MediGo | Sahi hospital khojein", pageDescription: "Bimari, location aur budget ke hisaab se hospitals khojein.",
    emergencyBannerTitle: "Emergency help · 108 call karein", emergencyBannerSubtitle: "Account ki zaroorat nahi",
    diseaseLabel: "Bimari ya symptoms", voiceSearch: "Bolkar search karein",
    procedurePlaceholder: "Procedure likhein ya chunein", procedureSuggestionHint: "Likhein ya suggestion mein se chunein.",
    costCityPlaceholder: "Apna shehar likhein", citySuggestionHint: "Shehar likhein; suggestions dikhenge.",
    searchUnderstood: "Search samajh li gayi", conditionLabel: "Bimari", specialistLabel: "Specialist", areaLabel: "Area",
    careGuidance: "Dekhbhal ki salah dekhein", firstAidLabel: "First aid:", warningSignsLabel: "Warning signs:",
    sortHospitals: "Hospitals sort karein", compareSelected: "Chune hue hospitals compare karein", compareInstructions: "Compare ke liye kam se kam 2 hospitals chunein. Save dabakar hospital save karein.",
    searchEmpty: "Matching hospitals dhoondhne ke liye upar symptoms likhein. Bina account search kar sakte hain.",
    noSavedHospitals: "Abhi koi hospital saved nahi", saveHospitalHint: "Baad mein dekhne ke liye hospital card par Save dabayein.",
    noFilteredHospitals: "Chune hue filters mein hospitals nahi mile", adjustFilters: "All hospitals chunein ya filters badal kar dekhein.",
    browseHospitals: "Hospitals dekhein", resetFilters: "Filters reset karein", compareTitle: "Hospitals compare karein",
    reportPreviewAlt: "Chuni hui medical report ka preview", nearYou: "Aapke paas", drive: "drive", open24Hours: "24 ghante khula",
    icuBeds: "ICU beds", ready: "Taiyar", estimatedProcedure: "Andazee procedure cost", outcome: "Outcome", rate: "Rate",
    verifiedProvider: "Dedicated specialists wala verified hospital.", save: "Save karein", saved: "Saved", removeSaved: "Saved hospitals se hatayein",
    compare: "Compare karein", added: "Jod diya", review: "Review", share: "Share karein", call: "Call karein", map: "Map",
    tapCompare: "Hospitals side-by-side compare karne ke liye card par + Compare dabayein.", noHospitalsSelected: "Koi hospital select nahi kiya",
    mainTools: "Main options", schemesListed: "{city} mein listed schemes", noSchemesListed: "Is shehar mein scheme listed nahi hai. Doosra shehar try karein ya hospital ko call karein.", enterCitySchemes: "Local schemes dekhne ke liye apna shehar likhein.",
    emergencyConditionLabel: "Emergency ki sthiti / main problem", selectReceivingHospital: "Madad ke liye hospital chunein *", refreshNearestGps: "GPS se paas ka hospital khojein", conditionChest: "Seene mein tez dard / dil ki problem", conditionAccident: "Road accident / gambhir chot / zyada khoon behna", conditionBreathing: "Saans lene mein dikkat / choking", conditionStroke: "Stroke ke sanket / chehra tedha / bolne mein dikkat", conditionFever: "Tez bukhar / daura", conditionPoison: "Zehar / saanp ka kaatna", conditionStomach: "Pet mein tez dard", conditionOther: "Koi aur emergency",
    localEmergencyFallbackNote: "Live hospital list nahi mil saki. Ye listed hospitals call ya raaste ke liye dikh rahe hain; abhi admission ki availability confirm nahi hai. Ambulance ke liye 108 call karein.", localEmergencyFallbackHeading: "Listed emergency hospitals dikh rahe hain", gpsUnavailableAll: "GPS available nahi · listed hospitals dikh rahe hain", locationUnavailableAll: "Location nahi mili · listed hospitals dikh rahe hain", enableLocationToSort: "Distance ke hisaab se hospitals dekhne ke liye location allow karein", sendingEmergencyAlert: "Emergency alert bheja ja raha hai…",
  });
  Object.assign(translations.pa, {
    pageTitle: "MediGo | ਸਹੀ ਹਸਪਤਾਲ ਲੱਭੋ", pageDescription: "ਬਿਮਾਰੀ, ਲੋਕੇਸ਼ਨ ਅਤੇ ਬਜਟ ਅਨੁਸਾਰ ਹਸਪਤਾਲ ਲੱਭੋ।",
    emergencyBannerTitle: "ਐਮਰਜੈਂਸੀ ਮਦਦ · 108 ਤੇ ਕਾਲ ਕਰੋ", emergencyBannerSubtitle: "ਖਾਤੇ ਦੀ ਲੋੜ ਨਹੀਂ",
    diseaseLabel: "ਬਿਮਾਰੀ ਜਾਂ ਲੱਛਣ", voiceSearch: "ਬੋਲ ਕੇ ਖੋਜੋ",
    procedurePlaceholder: "ਇਲਾਜ ਲਿਖੋ ਜਾਂ ਚੁਣੋ", procedureSuggestionHint: "ਲਿਖੋ ਜਾਂ ਸੁਝਾਵਾਂ ਵਿੱਚੋਂ ਚੁਣੋ।",
    costCityPlaceholder: "ਆਪਣਾ ਸ਼ਹਿਰ ਲਿਖੋ", citySuggestionHint: "ਸ਼ਹਿਰ ਲਿਖੋ; ਸੁਝਾਅ ਦਿਖਣਗੇ।",
    searchUnderstood: "ਖੋਜ ਸਮਝ ਆ ਗਈ", conditionLabel: "ਬਿਮਾਰੀ", specialistLabel: "ਮਾਹਰ ਡਾਕਟਰ", areaLabel: "ਇਲਾਕਾ",
    careGuidance: "ਦੇਖਭਾਲ ਦੀ ਸਲਾਹ ਵੇਖੋ", firstAidLabel: "ਮੁੱਢਲੀ ਸਹਾਇਤਾ:", warningSignsLabel: "ਚੇਤਾਵਨੀ ਦੇ ਲੱਛਣ:",
    sortHospitals: "ਹਸਪਤਾਲ ਛਾਂਟੋ", compareSelected: "ਚੁਣੇ ਹਸਪਤਾਲਾਂ ਦੀ ਤੁਲਨਾ ਕਰੋ", compareInstructions: "ਤੁਲਨਾ ਲਈ ਘੱਟੋ-ਘੱਟ 2 ਹਸਪਤਾਲਾਂ ਤੇ Compare ਦਬਾਓ। Save ਦਬਾ ਕੇ ਹਸਪਤਾਲ ਸੰਭਾਲੋ।",
    searchEmpty: "ਮਿਲਦੇ ਹਸਪਤਾਲ ਲੱਭਣ ਲਈ ਉੱਪਰ ਲੱਛਣ ਲਿਖੋ। ਖਾਤੇ ਤੋਂ ਬਿਨਾਂ ਵੀ ਖੋਜ ਸਕਦੇ ਹੋ।",
    noSavedHospitals: "ਹਾਲੇ ਕੋਈ ਹਸਪਤਾਲ ਸੰਭਾਲਿਆ ਨਹੀਂ", saveHospitalHint: "ਬਾਅਦ ਲਈ ਹਸਪਤਾਲ ਕਾਰਡ ਤੇ Save ਦਬਾਓ।",
    noFilteredHospitals: "ਚੁਣੇ ਫ਼ਿਲਟਰਾਂ ਵਿੱਚ ਹਸਪਤਾਲ ਨਹੀਂ ਮਿਲੇ", adjustFilters: "ਸਾਰੇ ਹਸਪਤਾਲ ਚੁਣੋ ਜਾਂ ਫ਼ਿਲਟਰ ਬਦਲੋ।",
    browseHospitals: "ਹਸਪਤਾਲ ਵੇਖੋ", resetFilters: "ਫ਼ਿਲਟਰ ਮੁੜ ਸੈੱਟ ਕਰੋ", compareTitle: "ਹਸਪਤਾਲਾਂ ਦੀ ਤੁਲਨਾ",
    reportPreviewAlt: "ਚੁਣੀ ਮੈਡੀਕਲ ਰਿਪੋਰਟ ਦੀ ਝਲਕ", nearYou: "ਤੁਹਾਡੇ ਨੇੜੇ", drive: "ਡਰਾਈਵ", open24Hours: "24 ਘੰਟੇ ਖੁੱਲ੍ਹਾ",
    icuBeds: "ICU ਬੈੱਡ", ready: "ਤਿਆਰ", estimatedProcedure: "ਇਲਾਜ ਦਾ ਅੰਦਾਜ਼ੀ ਖਰਚਾ", outcome: "ਨਤੀਜਾ", rate: "ਦਰ",
    verifiedProvider: "ਮਾਹਰ ਡਾਕਟਰਾਂ ਵਾਲਾ ਤਸਦੀਕਸ਼ੁਦਾ ਹਸਪਤਾਲ।", save: "ਸੰਭਾਲੋ", saved: "ਸੰਭਾਲਿਆ", removeSaved: "ਸੰਭਾਲੇ ਹਸਪਤਾਲਾਂ ਵਿੱਚੋਂ ਹਟਾਓ",
    compare: "ਤੁਲਨਾ ਕਰੋ", added: "ਜੋੜਿਆ", review: "ਸਮੀਖਿਆ", share: "ਸਾਂਝਾ ਕਰੋ", call: "ਕਾਲ ਕਰੋ", map: "ਨਕਸ਼ਾ",
    tapCompare: "ਹਸਪਤਾਲਾਂ ਦੀ ਤੁਲਨਾ ਲਈ ਕਾਰਡ ਤੇ + Compare ਦਬਾਓ।", noHospitalsSelected: "ਕੋਈ ਹਸਪਤਾਲ ਨਹੀਂ ਚੁਣਿਆ",
    mainTools: "ਮੁੱਖ ਵਿਕਲਪ", schemesListed: "{city} ਵਿੱਚ ਸੂਚੀਬੱਧ ਯੋਜਨਾਵਾਂ", noSchemesListed: "ਇਸ ਸ਼ਹਿਰ ਲਈ ਯੋਜਨਾ ਸੂਚੀਬੱਧ ਨਹੀਂ। ਹੋਰ ਸ਼ਹਿਰ ਅਜ਼ਮਾਓ ਜਾਂ ਹਸਪਤਾਲ ਨੂੰ ਫ਼ੋਨ ਕਰੋ।", enterCitySchemes: "ਸਥਾਨਕ ਯੋਜਨਾਵਾਂ ਲਈ ਆਪਣਾ ਸ਼ਹਿਰ ਲਿਖੋ।",
    emergencyConditionLabel: "ਐਮਰਜੈਂਸੀ ਦੀ ਹਾਲਤ / ਮੁੱਖ ਸਮੱਸਿਆ", selectReceivingHospital: "ਮਦਦ ਲਈ ਹਸਪਤਾਲ ਚੁਣੋ *", refreshNearestGps: "GPS ਨਾਲ ਨੇੜਲਾ ਹਸਪਤਾਲ ਲੱਭੋ", conditionChest: "ਛਾਤੀ ਵਿੱਚ ਤੇਜ਼ ਦਰਦ / ਦਿਲ ਦੀ ਸਮੱਸਿਆ", conditionAccident: "ਸੜਕ ਹਾਦਸਾ / ਗੰਭੀਰ ਸੱਟ / ਬਹੁਤ ਖੂਨ ਵਗਣਾ", conditionBreathing: "ਸਾਹ ਲੈਣ ਵਿੱਚ ਮੁਸ਼ਕਲ / ਦਮ ਘੁੱਟਣਾ", conditionStroke: "ਸਟ੍ਰੋਕ ਦੇ ਲੱਛਣ / ਚਿਹਰਾ ਢਿੱਲਾ / ਬੋਲਣ ਵਿੱਚ ਮੁਸ਼ਕਲ", conditionFever: "ਤੇਜ਼ ਬੁਖਾਰ / ਦੌਰਾ", conditionPoison: "ਜ਼ਹਿਰ / ਸੱਪ ਦਾ ਡੰਗ", conditionStomach: "ਪੇਟ ਵਿੱਚ ਤੇਜ਼ ਦਰਦ", conditionOther: "ਹੋਰ ਐਮਰਜੈਂਸੀ",
    localEmergencyFallbackNote: "ਹਸਪਤਾਲਾਂ ਦੀ ਲਾਈਵ ਸੂਚੀ ਨਹੀਂ ਮਿਲੀ। ਇਹ ਹਸਪਤਾਲ ਕਾਲ ਜਾਂ ਰਸਤੇ ਲਈ ਦਿਖਾਏ ਹਨ; ਦਾਖ਼ਲੇ ਦੀ ਮੌਜੂਦਾ ਉਪਲਬਧਤਾ ਪੱਕੀ ਨਹੀਂ। ਐਂਬੂਲੈਂਸ ਲਈ 108 ਤੇ ਕਾਲ ਕਰੋ।", localEmergencyFallbackHeading: "ਸੂਚੀਬੱਧ ਐਮਰਜੈਂਸੀ ਹਸਪਤਾਲ ਦਿਖਾਏ ਜਾ ਰਹੇ ਹਨ", gpsUnavailableAll: "GPS ਉਪਲਬਧ ਨਹੀਂ · ਸੂਚੀਬੱਧ ਹਸਪਤਾਲ ਦਿਖ ਰਹੇ ਹਨ", locationUnavailableAll: "ਲੋਕੇਸ਼ਨ ਨਹੀਂ ਮਿਲੀ · ਸੂਚੀਬੱਧ ਹਸਪਤਾਲ ਦਿਖ ਰਹੇ ਹਨ", enableLocationToSort: "ਦੂਰੀ ਅਨੁਸਾਰ ਹਸਪਤਾਲ ਦੇਖਣ ਲਈ ਲੋਕੇਸ਼ਨ ਦਿਓ", sendingEmergencyAlert: "ਐਮਰਜੈਂਸੀ ਸੁਨੇਹਾ ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ…",
  });

  const getLanguage = () => localStorage.getItem("medadvisor_lang") || "en";
  const text = (key, language = getLanguage()) =>
    translations[language]?.[key] || translations.en[key] || key;

  function applyLanguage(language) {
    const selected = translations[language] ? language : "en";
    localStorage.setItem("medadvisor_lang", selected);
    document.documentElement.lang = selected === "hi-Latn" ? "hi-Latn" : selected;
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = text(node.dataset.i18n, selected);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      node.placeholder = text(node.dataset.i18nPlaceholder, selected);
    });
    document.querySelectorAll("[data-i18n-title]").forEach((node) => {
      node.title = text(node.dataset.i18nTitle, selected);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
      node.setAttribute("aria-label", text(node.dataset.i18nAriaLabel, selected));
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((node) => {
      node.alt = text(node.dataset.i18nAlt, selected);
    });
    document.title = text("pageTitle", selected);
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = text("pageDescription", selected);
    document.querySelectorAll("#language-select").forEach((select) => {
      select.value = selected;
    });
    window.MEDIGO_LANGUAGE = selected;
    window.medigoText = text;
    window.dispatchEvent(new CustomEvent("medigo:languagechange", { detail: { language: selected } }));
  }

  window.MEDIGO_LOCALES = translations;
  window.medigoText = text;
  window.medigoSetLanguage = applyLanguage;
  document.addEventListener("DOMContentLoaded", () => {
    applyLanguage(getLanguage());
    document.querySelectorAll("#language-select").forEach((select) => {
      select.addEventListener("change", () => applyLanguage(select.value));
    });
  });
})();
