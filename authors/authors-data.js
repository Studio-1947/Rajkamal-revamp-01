/* 20 featured authors, from their profiles on rajkamalprakashan.com/authors (photos, dates, book counts and notable works as listed there; bios summarised).
   `match` = how the author's name is spelled in books-data.js, so their page can list the books in this catalogue. */
window.RK_AUTHOR_TAGS = [
  ["fiction", "Fiction"], ["poetry", "Poetry"], ["drama", "Drama"], ["essays", "Essays & criticism"],
  ["travel", "Travel & memoir"], ["film", "Film & lyrics"], ["journalism", "Journalism"]
];
window.RK_AUTHORS = [
  {
    id: "premchand", src: "premchand", name: "Premchand", hi: "प्रेमचन्द", born: 1880, died: 1936, place: "Lamhi, Varanasi",
    role: "Novelist & story writer", tags: ["fiction", "essays"], books: 30,
    bio: [
      "Premchand is the defining voice of modern Hindi and Urdu fiction. Born in a village near Varanasi, he lost his mother at seven and his father at sixteen, and carried the household through years of hardship.",
      "He first wrote in Urdu as Nawab Rai; when the British government seized his first story collection in 1910, he took the pen name Premchand. He left a twenty-year teaching career after the Jallianwala Bagh massacre and founded the literary journal Hans in 1930."
    ],
    awards: [], works: ["Godan", "Nirmala", "Sevasadan", "Karmabhoomi", "Ghaban", "Kafan Tatha Anya Kahaniyan"],
    match: ["Premchand"]
  },
  {
    id: "gulzar", src: "gulzar", name: "Gulzar", hi: "गुलज़ार", born: 1934, place: "Dina (now in Pakistan)",
    role: "Poet, lyricist & filmmaker", tags: ["poetry", "film", "fiction"], books: 39,
    bio: [
      "Gulzar is a poet-filmmaker whose voice runs through both Hindi cinema and Hindi-Urdu poetry. He began as an assistant director to Bimal Roy and went on to write dialogue, screenplays and songs with a style entirely his own.",
      "Beyond films he has written poetry collections, plays, novels and much-loved children's books, and has been honoured with an Oscar and the Sahitya Akademi Award."
    ],
    awards: ["Academy Award", "Sahitya Akademi Award"], works: ["Mera Kuchh Samaan", "Paaji Nazmein", "Gulzar Ke Geet", "Paansa", "Boski Ke Tal-Patal"],
    match: ["Gulzar"]
  },
  {
    id: "nirmal-verma", src: "nirmal-verma", name: "Nirmal Verma", hi: "निर्मल वर्मा", born: 1929, died: 2005, place: "Shimla, Himachal Pradesh",
    role: "Novelist, story writer & essayist", tags: ["fiction", "essays", "travel"], books: 33,
    bio: [
      "Nirmal Verma is one of the most celebrated prose writers of modern Hindi, known for quiet, inward fiction and for bringing world literature into Hindi through his translations.",
      "He received the Sahitya Akademi Award, the Padma Bhushan and the Jnanpith, and the Government of India nominated him for the Nobel Prize in 2005, the year he died."
    ],
    awards: ["Jnanpith", "Padma Bhushan", "Sahitya Akademi Award"], works: ["Parinde", "Lal Teen Ki Chhat", "Raat Ka Reporter", "Kavve Aur Kala Pani", "Pichhli Garmiyon Mein"],
    match: ["Nirmal Verma"]
  },
  {
    id: "krishna-sobti", src: "krishna-sobti", name: "Krishna Sobti", hi: "कृष्णा सोबती", born: 1925, died: 2019, place: "Gujrat (now in Pakistan)",
    role: "Novelist", tags: ["fiction", "essays"], books: 27,
    bio: [
      "Krishna Sobti was among the boldest and most original novelists in Hindi, famous for women characters who speak with rare frankness and for a language rooted in the speech of Punjab.",
      "Over a long literary life she kept outgrowing her own earlier work, and was honoured with the Jnanpith and the Sahitya Akademi Award."
    ],
    awards: ["Jnanpith", "Sahitya Akademi Award"], works: ["Mitro Marjani", "Ai Larki", "Zindaginama", "Wah Samay Yah Samay", "Buddh Ka Kamandal Laddakh"],
    match: ["Krishna Sobti"]
  },
  {
    id: "rahul-sankrityayan", src: "rahul-sankrityayan", name: "Rahul Sankrityayan", hi: "राहुल सांकृत्यायन", born: 1893, died: 1963, place: "Pandaha, Azamgarh",
    role: "Scholar, traveller & writer", tags: ["travel", "essays", "fiction"], books: 24,
    bio: [
      "Rahul Sankrityayan — scholar, freedom fighter, Buddhist monk and tireless traveller — is called the father of Hindi travel writing.",
      "He wrote on history, philosophy, science and culture, travelled widely in search of rare manuscripts, and received the Sahitya Akademi Award (1958) and the Padma Bhushan (1963)."
    ],
    awards: ["Padma Bhushan", "Sahitya Akademi Award"], works: ["Volga Se Ganga", "Ghumakkad Shastra", "Meri Tibbat Yatra", "Kinnar Desh Mein", "Manav-Samaj"],
    match: ["Rahul Sankrityayan"]
  },
  {
    id: "mahadevi-verma", src: "mahadevi-verma", name: "Mahadevi Verma", hi: "महादेवी वर्मा", born: 1907, died: 1987, place: "Farrukhabad, Uttar Pradesh",
    role: "Poet & memoirist", tags: ["poetry", "travel", "essays"], books: 17,
    bio: [
      "Mahadevi Verma is one of the four pillars of Chhayavad poetry and a pioneering voice on women's lives in Hindi prose.",
      "She took an M.A. in Sanskrit from Allahabad University, led Prayag Mahila Vidyapith as principal and later vice-chancellor, and received the Jnanpith and the Padma Vibhushan."
    ],
    awards: ["Jnanpith", "Padma Vibhushan"], works: ["Shrinkhala Ki Kariyan", "Path Ke Sathi", "Mera Parivar", "Neerja", "Smriti Chitra"],
    match: ["Mahadevi Verma"]
  },
  {
    id: "nirala", src: "suryakant-tripathi-nirala", name: "Suryakant Tripathi 'Nirala'", hi: "सूर्यकान्त त्रिपाठी 'निराला'", born: 1896, died: 1961, place: "Midnapore, Bengal",
    role: "Poet & novelist", tags: ["poetry", "fiction", "essays"], books: 43,
    bio: [
      "Nirala, one of the great poets of Chhayavad, broke the old rules of Hindi metre and gave the language its first great free verse.",
      "Largely self-taught in Hindi, Bengali, English and Sanskrit, he served the Mahishadal estate before devoting his life to editing, writing and translation — poetry, novels, stories and essays alike."
    ],
    awards: [], works: ["Kukurmutta", "Kullibhat", "Alka", "Nirupama", "Sampoorn Baal Rachnayein"],
    match: ["Suryakant Tripathi 'Nirala'"]
  },
  {
    id: "dinkar", src: "ramdhari-singh-dinkar-", name: "Ramdhari Singh 'Dinkar'", hi: "रामधारी सिंह 'दिनकर'", born: 1908, died: 1974, place: "Simariya, Begusarai",
    role: "Poet & essayist", tags: ["poetry", "essays"], books: 50,
    bio: [
      "Dinkar, the 'Rashtrakavi', wrote poetry of fire and conscience that became part of India's national voice.",
      "A history graduate from Patna, he served as a university vice-chancellor and government adviser. Urvashi won him the Jnanpith in 1973, and Sanskriti Ke Chaar Adhyay remains a landmark of Indian cultural history."
    ],
    awards: ["Jnanpith", "Padma Bhushan", "Sahitya Akademi Award"], works: ["Rashmirathi", "Urvashi", "Sanskriti Ke Chaar Adhyay", "Kurukshetra", "Dilli"],
    match: ["Ramdhari Singh 'Dinkar'"]
  },
  {
    id: "phanishwarnath-renu", src: "phanishwarnath-renu", name: "Phanishwarnath Renu", hi: "फणीश्वरनाथ रेणु", born: 1921, died: 1977, place: "Purnia, Bihar",
    role: "Novelist & story writer", tags: ["fiction", "travel"], books: 20,
    bio: [
      "Renu brought the music of rural Bihar into Hindi fiction; Maila Aanchal created the 'aanchalik' regional novel.",
      "He was active in the 1942 freedom struggle and Nepal's revolution against the Rana regime, wrote memoirs and reportage too, and returned his Padma Shri in protest during the JP movement."
    ],
    awards: ["Padma Shri"], works: ["Maila Aanchal", "Parti: Parikatha", "Thumari", "Rinjal Dhanjal", "Nepali Kranti-Katha"],
    match: ["Phanishwarnath Renu"]
  },
  {
    id: "nagarjun", src: "nagarjun", name: "Nagarjun", hi: "नागार्जुन", born: 1911, died: 1998, place: "Darbhanga, Bihar",
    role: "Poet & novelist", tags: ["poetry", "fiction"], books: 14,
    bio: [
      "Nagarjun (Vaidyanath Mishra 'Yatri') was the people's poet of Hindi — sharp, funny and fearless — and a novelist of village Mithila.",
      "He wrote in Hindi, Maithili, Sanskrit and Bengali, took part in many political and social movements, and won the Sahitya Akademi Award for his Maithili poetry."
    ],
    awards: ["Sahitya Akademi Award"], works: ["Baba Batesarnath", "Dukhmochan", "Nayi Paudh", "Bhasmankur", "Nagarjun Rachanawali"],
    match: ["Nagarjun"]
  },
  {
    id: "mohan-rakesh", src: "mohan-rakesh", name: "Mohan Rakesh", hi: "मोहन राकेश", born: 1925, died: 1972, place: "Amritsar, Punjab",
    role: "Playwright & story writer", tags: ["drama", "fiction"], books: 15,
    bio: [
      "Mohan Rakesh was a leading voice of the Nai Kahani movement and the playwright who gave modern Hindi theatre its classics.",
      "He taught, edited and wrote across cities, served on the Film Finance Corporation and the Censor Board, and received the Sangeet Natak Akademi Award and a Nehru Fellowship."
    ],
    awards: ["Sangeet Natak Akademi Award"], works: ["Aashadh Ka Ek Din", "Aadhe-Adhoore", "Andhere Band Kamare", "Lehron Ke Rajhans", "Ande Ke Chhilke"],
    match: ["Mohan Rakesh"]
  },
  {
    id: "hazariprasad-dwivedi", src: "hazariprasad-dwivedi", name: "Hazariprasad Dwivedi", hi: "हजारीप्रसाद द्विवेदी", born: 1907, died: 1979, place: "Ballia, Uttar Pradesh",
    role: "Scholar, critic & novelist", tags: ["essays", "fiction"], books: 27,
    bio: [
      "Hazariprasad Dwivedi was one of the great scholar-writers of Hindi — a literary historian, essayist and novelist steeped in Sanskrit and Indian tradition.",
      "He studied at Banaras Hindu University and taught at Shantiniketan, BHU and Punjab University, receiving the Padma Bhushan (1957) and the Sahitya Akademi Award (1973)."
    ],
    awards: ["Padma Bhushan", "Sahitya Akademi Award"], works: ["Banbhatt Ki Aatmakatha", "Anamdas Ka Potha", "Punarnava", "Kalidas Ki Lalitya Yojana"],
    match: ["Hazariprasad Dwivedi"]
  },
  {
    id: "muktibodh", src: "gajanan-madhav-muktibodh", name: "Gajanan Madhav Muktibodh", hi: "गजानन माधव मुक्तिबोध", born: 1917, died: 1964, place: "Gwalior, Madhya Pradesh",
    role: "Poet & critic", tags: ["poetry", "essays"], books: 12,
    bio: [
      "Muktibodh is the poet who bridged progressive and modern Hindi poetry — dense, visionary and unflinching about the inner struggle of the thinking mind.",
      "He took his M.A. in Hindi from Nagpur and taught in many cities. His poems, stories, criticism and cultural writing are collected in the eight-volume Muktibodh Samagra."
    ],
    awards: [], works: ["Chand Ka Munh Tedha Hai", "Bhuri-Bhuri Khak-Dhool", "Nayi Kavita Ka Aatmasangharsh", "Pratinidhi Kavitayen"],
    match: ["Gajanan Madhav Muktibodh"]
  },
  {
    id: "jaishankar-prasad", src: "jaishankar-prasad", name: "Jaishankar Prasad", hi: "जयशंकर प्रसाद", born: 1890, died: 1937, place: "Varanasi, Uttar Pradesh",
    role: "Poet, playwright & novelist", tags: ["poetry", "drama", "fiction"], books: 20,
    bio: [
      "Jaishankar Prasad is a founding figure of Chhayavad, and his epic Kamayani is counted among the summits of Hindi poetry.",
      "Though his schooling ended at the eighth grade, he studied Sanskrit, Pali, English, history and philosophy on his own, and wrote poetry, plays, novels and essays across a short 48-year life."
    ],
    awards: [], works: ["Kamayani", "Titli", "Iravati", "Kavya Aur Kala Tatha Anya Nibandh", "Prasad Ke Sampoorna Upanyas"],
    match: ["Jaishankar Prasad"]
  },
  {
    id: "sahir-ludhianvi", src: "sahir-ludhianvi", name: "Sahir Ludhianvi", hi: "साहिर लुधियानवी", born: 1921, died: 1980, place: "Ludhiana, Punjab",
    role: "Poet & lyricist", tags: ["poetry", "film"], books: 2,
    bio: [
      "Sahir Ludhianvi was the poet of rebellion and romance whose songs became some of Hindi cinema's most loved.",
      "He published several collections, edited literary magazines, and received the Padma Shri and multiple Filmfare Awards for his lyrics."
    ],
    awards: ["Padma Shri", "Filmfare Awards"], works: ["Talkhiyaan", "Parchhaiyaan", "Gaata Jaye Banjara", "Aao Ki Koi Khwab Bunen", "Sahir Samagra"],
    match: ["Sahir Ludhianvi"]
  },
  {
    id: "kaifi-azmi", src: "kaifi-azmi", name: "Kaifi Azmi", hi: "कैफ़ी आज़मी", born: 1919, died: 2002, place: "Majwan, Azamgarh",
    role: "Poet & lyricist", tags: ["poetry", "film"], books: 4,
    bio: [
      "Kaifi Azmi was an Urdu poet of the progressive movement and the lyricist behind many of Hindi cinema's finest songs.",
      "Sent to Lucknow to study theology, he turned to poetry instead — reciting his first ghazal at eleven — and went on to win the Sahitya Akademi Award and the Soviet Land Nehru Prize."
    ],
    awards: ["Sahitya Akademi Award", "Soviet Land Nehru Prize"], works: ["Awara Sajde", "Meri Aawaz Suno", "Kaifiyaat", "Nai Gulistan"],
    match: ["Kaifi Azmi"]
  },
  {
    id: "shrilal-shukla", src: "shrilal-shukla", name: "Shrilal Shukla", hi: "श्रीलाल शुक्ल", born: 1925, died: 2011, place: "Atrauli, Lucknow",
    role: "Satirist & novelist", tags: ["fiction"], books: 20,
    bio: [
      "Shrilal Shukla is Hindi's great satirist, and Raag Darbari — his merciless, hilarious portrait of a north Indian village — is one of its best-known novels.",
      "Raag Darbari has been translated into many Indian languages and English. He received the Jnanpith, the Vyas Samman, the Padma Bhushan and the Sahitya Akademi Award."
    ],
    awards: ["Jnanpith", "Padma Bhushan", "Vyas Samman", "Sahitya Akademi Award"], works: ["Raag Darbari", "Umraonagar Mein Kuchh Din", "Avishkar Joote Ka", "Khabron Ki Jugali"],
    match: ["Shrilal Shukla"]
  },
  {
    id: "mridula-garg", src: "mridula-garg", name: "Mridula Garg", hi: "मृदुला गर्ग", born: 1938, place: "Kolkata",
    role: "Novelist & story writer", tags: ["fiction", "drama", "essays"], books: 11,
    bio: [
      "Mridula Garg writes novels, stories, plays, essays and travel memoirs, and is known for fiction that looks at women's inner lives with unusual candour.",
      "Kath Gulab won the Vyas Samman and Mil Jul Man the Sahitya Akademi Award; her novels have been translated into German, English, Russian and several Indian languages."
    ],
    awards: ["Vyas Samman", "Sahitya Akademi Award"], works: ["Chittakobara", "Kath Gulab", "Uske Hisse Ki Dhoop", "Mil Jul Man", "Anitya"],
    match: ["Mridula Garg"]
  },
  {
    id: "piyush-mishra", src: "piyush-mishra", name: "Piyush Mishra", hi: "पीयूष मिश्रा", born: 1963, place: "Gwalior, Madhya Pradesh",
    role: "Actor, poet & lyricist", tags: ["poetry", "drama", "film"], books: 9,
    bio: [
      "Piyush Mishra — 'Piyush Bhai' to friends and 'Sir' to students — did theatre in Delhi from 1983 to 2003 before moving to the Mumbai film industry.",
      "His plays, poems and songs move between love, change and biting social commentary."
    ],
    awards: [], works: ["Tumhari Auqat Kya Hai Piyush Mishra", "Kuchh Ishq Kiya Kuchh Kaam Kiya", "Gagan Damama Bajyo", "Mere Manch Ki Sargam"],
    match: ["Piyush Mishra"]
  },
  {
    id: "ravish-kumar", src: "ravish-kumar", name: "Ravish Kumar", hi: "रवीश कुमार", born: 1974, place: "Jitwarpur, Motihari",
    role: "Journalist & writer", tags: ["journalism", "essays"], books: 3,
    bio: [
      "Ravish Kumar is one of India's best-known journalists, the face of NDTV's Ravish Ki Report and Prime Time.",
      "From a village in Bihar's Motihari district to Delhi, his books carry the same plain-spoken voice. He received the Ramon Magsaysay Award."
    ],
    awards: ["Ramon Magsaysay Award"], works: ["Bolna Hi Hai", "Ishq Mein Shahar Hona", "Ishq Koi News Nahin"],
    match: ["Ravish Kumar"]
  }
];
