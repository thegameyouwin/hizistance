import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import ThankYouVolunteer from "./ThankYouVolunteer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface VoterDriveSectionProps {
  showThankYou?: boolean;
}

// Kenyan Counties (All 47)
const kenyanCounties = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita/Taveta",
  "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru",
  "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua",
  "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot",
  "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo/Marakwet", "Nandi",
  "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho",
  "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya",
  "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi City"
];

// Kenyan Constituencies by County (Sample - you can expand)
// All 290 Kenyan Constituencies by County
const constituenciesByCounty = {
  "Mombasa": [
    "Changamwe", "Jomvu", "Kisauni", "Nyali", "Likoni", "Mvita"
  ],
  "Kwale": [
    "Msambweni", "Lungalunga", "Matuga", "Kinango"
  ],
  "Kilifi": [
    "Kilifi North", "Kilifi South", "Kaloleni", "Rabai", "Ganze", "Malindi", "Magarini"
  ],
  "Tana River": [
    "Garsen", "Galole", "Bura"
  ],
  "Lamu": [
    "Lamu East", "Lamu West"
  ],
  "Taita/Taveta": [
    "Taveta", "Wundanyi", "Mwatate", "Voi"
  ],
  "Garissa": [
    "Garissa Township", "Balambala", "Lagdera", "Dadaab", "Fafi", "Ijara"
  ],
  "Wajir": [
    "Wajir North", "Wajir East", "Tarbaj", "Wajir West", "Eldas", "Wajir South"
  ],
  "Mandera": [
    "Mandera West", "Banissa", "Mandera North", "Mandera South", "Mandera East", "Lafey"
  ],
  "Marsabit": [
    "Moyale", "North Horr", "Saku", "Laisamis"
  ],
  "Isiolo": [
    "Isiolo North", "Isiolo South"
  ],
  "Meru": [
    "Igembe South", "Igembe Central", "Igembe North", "Tigania West", "Tigania East", 
    "North Imenti", "Buuri", "Central Imenti", "South Imenti"
  ],
  "Tharaka-Nithi": [
    "Maara", "Chuka/Igambang'ombe", "Tharaka"
  ],
  "Embu": [
    "Manyatta", "Runyenjes", "Mbeere North", "Mbeere South"
  ],
  "Kitui": [
    "Mwingi North", "Mwingi West", "Mwingi Central", "Kitui West", "Kitui Rural", 
    "Kitui Central", "Kitui East", "Kitui South"
  ],
  "Machakos": [
    "Masinga", "Yatta", "Kangundo", "Matungulu", "Kathiani", "Mavoko", "Machakos Town", "Mwala"
  ],
  "Makueni": [
    "Mbooni", "Kilome", "Kaiti", "Makueni", "Kibwezi West", "Kibwezi East"
  ],
  "Nyandarua": [
    "Kinangop", "Kipipiri", "Ol Kalou", "Ol Jorok", "Ndaragwa"
  ],
  "Nyeri": [
    "Tetu", "Kieni", "Mathira", "Othaya", "Mukurweini", "Nyeri Town"
  ],
  "Kirinyaga": [
    "Mwea", "Gichugu", "Ndia", "Kirinyaga Central"
  ],
  "Murang'a": [
    "Kangema", "Mathioya", "Kiharu", "Kigumo", "Maragwa", "Kandara", "Gatanga"
  ],
  "Kiambu": [
    "Gatundu South", "Gatundu North", "Juja", "Thika Town", "Ruiru", "Githunguri", 
    "Kiambaa", "Kiambu Town", "Kabete", "Kikuyu", "Limuru", "Lari"
  ],
  "Turkana": [
    "Turkana North", "Turkana West", "Turkana Central", "Loima", "Turkana South", "Turkana East"
  ],
  "West Pokot": [
    "Kapenguria", "Sigor", "Kacheliba", "Pokot South"
  ],
  "Samburu": [
    "Samburu West", "Samburu North", "Samburu East"
  ],
  "Trans Nzoia": [
    "Kwanza", "Endebess", "Saboti", "Kiminini", "Cherangany"
  ],
  "Uasin Gishu": [
    "Soy", "Turbo", "Moiben", "Ainabkoi", "Kapseret", "Kesses"
  ],
  "Elgeyo/Marakwet": [
    "Marakwet East", "Marakwet West", "Keiyo North", "Keiyo South"
  ],
  "Nandi": [
    "Tinderet", "Aldai", "Nandi Hills", "Chesumei", "Emgwen", "Mosop"
  ],
  "Baringo": [
    "Tiaty", "Baringo North", "Baringo Central", "Baringo South", "Mogotio", "Eldama Ravine"
  ],
  "Laikipia": [
    "Laikipia West", "Laikipia East", "Laikipia North"
  ],
  "Nakuru": [
    "Molo", "Njoro", "Naivasha", "Gilgil", "Kuresoi South", "Kuresoi North", 
    "Subukia", "Rongai", "Bahati", "Nakuru Town West", "Nakuru Town East"
  ],
  "Narok": [
    "Kilgoris", "Emurua Dikirr", "Narok North", "Narok East", "Narok South", "Narok West"
  ],
  "Kajiado": [
    "Kajiado North", "Kajiado Central", "Kajiado East", "Kajiado West", "Kajiado South"
  ],
  "Kericho": [
    "Kipkelion East", "Kipkelion West", "Ainamoi", "Bureti", "Belgut", "Sigowet/Soin"
  ],
  "Bomet": [
    "Sotik", "Chepalungu", "Bomet East", "Bomet Central", "Konoin"
  ],
  "Kakamega": [
    "Lugari", "Likuyani", "Malava", "Lurambi", "Navakholo", "Mumias West", "Mumias East", 
    "Matungu", "Butere", "Khwisero", "Shinyalu", "Ikolomani"
  ],
  "Vihiga": [
    "Vihiga", "Sabatia", "Hamisi", "Luanda", "Emuhaya"
  ],
  "Bungoma": [
    "Mt. Elgon", "Sirisia", "Kabuchai", "Bumula", "Kanduyi", "Webuye East", 
    "Webuye West", "Kimilili", "Tongaren"
  ],
  "Busia": [
    "Teso North", "Teso South", "Nambale", "Matayos", "Butula", "Funyula", "Budalangi"
  ],
  "Siaya": [
    "Ugenya", "Ugunja", "Alego Usonga", "Gem", "Bondo", "Rarieda"
  ],
  "Kisumu": [
    "Kisumu East", "Kisumu West", "Kisumu Central", "Seme", "Nyando", "Muhoroni", "Nyakach"
  ],
  "Homa Bay": [
    "Kasipul", "Kabondo Kasipul", "Karachuonyo", "Rangwe", "Homa Bay Town", "Ndhiwa", "Suba North", "Suba South"
  ],
  "Migori": [
    "Rongo", "Awendo", "Suna East", "Suna West", "Uriri", "Nyatike", "Kuria East", "Kuria West"
  ],
  "Kisii": [
    "Bonchari", "South Mugirango", "Bomachoge Borabu", "Bobasi", "Bomachoge Chache", 
    "Nyaribari Masaba", "Nyaribari Chache", "Kitutu Chache North", "Kitutu Chache South"
  ],
  "Nyamira": [
    "Kitutu Masaba", "West Mugirango", "North Mugirango", "Borabu"
  ],
  "Nairobi City": [
    "Westlands", "Dagoretti North", "Dagoretti South", "Langata", "Kibra", "Roysambu", 
    "Kasarani", "Ruaraka", "Embakasi South", "Embakasi North", "Embakasi Central", 
    "Embakasi East", "Embakasi West", "Makadara", "Kamukunji", "Starehe", "Mathare"
  ]
};

// Wards by Constituency (Sample)
const wardsByConstituency = {
  // MOMBASA COUNTY
  "Changamwe": ["Port Reitz", "Kipevu", "Airport", "Changamwe", "Chaani"],
  "Jomvu": ["Jomvu Kuu", "Miritini", "Mikindani"],
  "Kisauni": ["Mjambere", "Junda", "Bamburi", "Mwakirunge", "Mtopanga", "Magogoni", "Shanzu"],
  "Nyali": ["Frere Town", "Ziwa la Ng'ombe", "Mkomani", "Kongowea", "Kadzandani"],
  "Likoni": ["Mtongwe", "Shika Adabu", "Bofu", "Likoni", "Timbwani"],
  "Mvita": ["Mji wa Kale/Makadara", "Tudor", "Tononoka", "Shimanzi/Ganjoni", "Majengo"],

  // KWAALE COUNTY
  "Msambweni": ["Gombato Bongwe", "Ukunda", "Kinondo", "Mackinnon Road", "Pongwe/Kikoneni", "Dzombo", "Mwereni"],
  "Lungalunga": ["Puma", "Kinango", "Mackinnon Road", "Ndavaya", "Chengoni/Samburu", "Mwavumbo", "Kasemeni"],
  "Matuga": ["Tiwi", "Kubo South", "Mkongani", "Ndavaya", "Kikoneni", "Mwawe", "Msambweni"],
  "Kinango": ["Kinango", "Mackinnon Road", "Chengoni/Samburu", "Mwavumbo", "Kasemeni", "Tezo", "Sokoni"],

  // KILIFI COUNTY
  "Kilifi North": ["Tezo", "Sokoni", "Kibarani", "Dabaso", "Matsangoni", "Watamu", "Mnarani"],
  "Kilifi South": ["Junju", "Mwarakaya", "Shimo la Tewa", "Chasimba", "Mtepeni"],
  "Kaloleni": ["Mariakani", "Kayafungo", "Kaloleni", "Mwanamwinga"],
  "Rabai": ["Mwawesa", "Ruruma", "Kambe/Ribe", "Rabai/Kisurutuni"],
  "Ganze": ["Bamba", "Jaribuni", "Sokoke", "Dida Ware", "Maji ya Chumvi", "Gongoni", "Mwarakaya"],
  "Malindi": ["Malindi Town", "Shella", "Ganda", "Mijomboni", "Matsangoni", "Madunguni"],
  "Magarini": ["Adu", "Garashi", "Gongoni", "Magarini", "Marikebuni", "Sabaki"],

  // TANA RIVER COUNTY
  "Garsen": ["Kipini East", "Garsen South", "Kipini West", "Garsen Central", "Garsen West", "Garsen North"],
  "Galole": ["Kinakomba", "Mikinduni", "Chewani", "Wayu", "Bangale", "Sala", "Madogo"],
  "Bura": ["Chewele", "Hirimani", "Bangale", "Galole", "Madogo", "Sala"],

  // LAMU COUNTY
  "Lamu East": ["Witu", "Hindi", "Mkunumbi", "Hongwe", "Bahari"],
  "Lamu West": ["Shella", "Mkomani", "Hindi", "Mkunumbi", "Hongwe", "Bahari"],

  // TAITA/TAVETA COUNTY
  "Taveta": ["Chala", "Mahoo", "Bomani", "Mboghoni", "Mata"],
  "Wundanyi": ["Werugha", "Wundanyi/Mbale", "Mwanda/Mghange", "Ronge", "Mbololo"],
  "Mwatate": ["Bura", "Chawia", "Wusi/Kishamba", "Mwatate", "Rong'e"],
  "Voi": ["Mbololo", "Sagala", "Kaloleni", "Marungu", "Kasigau", "Ngolia"],

  // GARISSA COUNTY
  "Garissa Township": ["Garissa", "Ijara", "Masalani", "Sankuri", "Ijara Township"],
  "Balambala": ["Balambala", "Danyere", "Jarajara", "Saka", "Sankuri"],
  "Lagdera": ["Modogashe", "Benane", "Goreale", "Maalimin", "Sabena"],
  "Dadaab": ["Dagahaley", "Liboi", "Abakaile", "Dadaab", "Labasigale"],
  "Fafi": ["Bura", "Dekaharia", "Jarajila", "Fafi", "Nanighi"],
  "Ijara": ["Masalani", "Sangailu", "Ijara", "Kotile", "Goreale"],

  // WAJIR COUNTY
  "Wajir North": ["Buna", "Dekaharia", "Jarajila", "Fafi", "Nanighi"],
  "Wajir East": ["Wajir Bor", "Barwago", "Khorof/Harar", "Batalu", "Wajir East"],
  "Tarbaj": ["Elben", "Sarman", "Tarbaj", "Wargadud", "Arbajahan"],
  "Wajir West": ["Gurar", "Bute", "Korondile", "Malkagufu", "Batalu"],
  "Eldas": ["Eldas", "Della", "Lakoley South/Basir", "Elnur/Tula Tula"],
  "Wajir South": ["Wajir South", "Gurar", "Buna", "Habaswein", "Sarman"],

  // MANDERA COUNTY
  "Mandera West": ["Elwak South", "Elwak North", "Shimbir Fatuma", "Arabia", "Libehia"],
  "Banissa": ["Banissa", "Derkhale", "Guba", "Malkamari", "Takaba South"],
  "Mandera North": ["Rhamu", "Rhamu Dimtu", "Wargadud", "Kutulo", "Ashabito"],
  "Mandera South": ["Omar Jillo", "Wargadud", "Khalalio", "Bulla Mpya", "Burmayo"],
  "Mandera East": ["Khalalio", "Guba", "Hareri/Hareri", "Rhamu", "Rhamu Dimtu"],
  "Lafey": ["Lafey", "Salam", "Warankara", "Godoma", "Madogo"],

  // MARSABIT COUNTY
  "Moyale": ["Moyale Township", "Uran", "Obbu", "Dukana", "Moyale", "Sololo"],
  "North Horr": ["North Horr", "Dukana", "Maikona", "Turbi", "Kalacha"],
  "Saku": ["Sagante/Jaldesa", "Karare", "Marsabit Central", "Loiyangalani", "Kargi/South Horr"],
  "Laisamis": ["Laisamis", "Korr/Ngurunit", "Logo Logo", "Loiyangalani", "Kargi"],

  // ISIOLO COUNTY
  "Isiolo North": ["Isiolo", "Wabera", "Bulapesa", "Moyale", "Garbatulla"],
  "Isiolo South": ["Garba Tulla", "Kina", "Sericho", "Oldonyiro", "Merti"],

  // MERU COUNTY
  "Igembe South": ["Maua", "Kiegoi/Antubochiu", "Athiru Gaiti", "Akachiu", "Kanuni"],
  "Igembe Central": ["Kangeta", "Akirang'ondu", "Athiru Ruujine", "Igembe East", "Njia"],
  "Igembe North": ["Kiang'ondu", "Athiru Ruujine", "Igembe East", "Mitunguu", "Kiegoi"],
  "Tigania West": ["Mikinduri", "Kiguchwa", "Muthara", "Karama", "Municipality"],
  "Tigania East": ["Mikinduri", "Kiguchwa", "Muthara", "Karama", "Municipality"],
  "North Imenti": ["Abothuguchi Central", "Abothuguchi West", "Kiagu", "Mitunguu", "Kiegoi"],
  "Buuri": ["Timau", "Kisima", "Kiirua/Naari", "Ruiri", "Kibirichia"],
  "Central Imenti": ["Abogeta East", "Abogeta West", "Nkuene", "Mitunguu", "Kiegoi"],
  "South Imenti": ["Mwangathia", "Abothuguchi West", "Kiagu", "Mitunguu", "Kiegoi"],

  // THARAKA-NITHI COUNTY
  "Maara": ["Mitheru", "Muthambi", "Mwimbi", "Ganga", "Chogoria"],
  "Chuka/Igambang'ombe": ["Mariani", "Karingani", "Magumoni", "Mugwe", "Igambang'ombe"],
  "Tharaka": ["Gatunga", "Mukothima", "Nkondi", "Chiakariga", "Marimanti"],

  // EMBU COUNTY
  "Manyatta": ["Ruguru/Ngandori", "Kithimu", "Nginda", "Mbeti North", "Kirimari"],
  "Runyenjes": ["Gaturi North", "Gaturi South", "Kagaari South", "Kagaari North", "Kyeni North", "Kyeni South"],
  "Mbeere North": ["Mwea", "Makima", "Mbeti South", "Mavuria", "Kiambere"],
  "Mbeere South": ["Mwea", "Makima", "Mbeti South", "Mavuria", "Kiambere"],

  // KITUI COUNTY
  "Mwingi North": ["Kyome/Thaana", "Nguutani", "Migunga", "Keewan", "Ikombe"],
  "Mwingi West": ["Mui", "Waita", "Kanziko", "Miambani", "Nuu"],
  "Mwingi Central": ["Nguni", "Nuu", "Mui", "Waita", "Mutonguni"],
  "Kitui West": ["Mutonguni", "Kauwi", "Matinyani", "Kwa Mutonga/Kithumula", "Kisasi"],
  "Kitui Rural": ["Kwa Mutonga/Kithumula", "Kisasi", "Mbitini", "Kwavonza/Yatta", "Kanyangi"],
  "Kitui Central": ["Miambani", "Township", "Kyangwithya West", "Mulango", "Kisasi"],
  "Kitui East": ["Voo/Kyamatu", "Endau/Malalani", "Mutito/Kaliku", "Ikanga/Kyatune", "Kanziko"],
  "Kitui South": ["Ikanga/Kyatune", "Mutomo", "Mutha", "Ikutha", "Kanziko"],

  // MACHAKOS COUNTY
  "Masinga": ["Masinga Central", "Ekalakala", "Muthesya", "Ndithini", "Ndalani"],
  "Yatta": ["Kithimani", "Ikombe", "Katangi", "Kangundo North", "Kangundo South"],
  "Kangundo": ["Kangundo North", "Kangundo South", "Kangundo Central", "Kangundo West", "Matungulu"],
  "Matungulu": ["Tala", "Matungulu North", "Matungulu East", "Matungulu West", "Kyeleni"],
  "Kathiani": ["Mitaboni", "Kathiani Central", "Upper Kaewa/Iveti", "Lower Kaewa/Kaani", "Kola"],
  "Mavoko": ["Athi River", "Kinanie", "Muthwani", "Syokimau/Mulolongo"],
  "Machakos Town": ["Muvuti/Kiima-Kimwe", "Kola", "Mbiuni", "Makutano/Mwala", "Masii"],
  "Mwala": ["Mbiuni", "Makutano/Mwala", "Masii", "Muthetheni", "Wamunyu"],

  // MAKUENI COUNTY
  "Mbooni": ["Kithungo/Kitundu", "Kisau/Kiteta", "Waia/Kako", "Kalawa", "Kasikeu"],
  "Kilome": ["Mbitini", "Makindu", "Nguumo", "Kikumbulyu North", "Kikumbulyu South"],
  "Kaiti": ["Kikumbulyu North", "Kikumbulyu South", "Nguu/Masumba", "Emali/Mulala", "Masongaleni"],
  "Makueni": ["Wote", "Muvau/Kikuumini", "Mavindini", "Kitise/Kithuki", "Kathonzweni"],
  "Kibwezi West": ["Kikumbulyu North", "Kikumbulyu South", "Nguu/Masumba", "Emali/Mulala", "Masongaleni"],
  "Kibwezi East": ["Masongaleni", "Mtito Andei", "Thange", "Ivingoni/Nzambani", "Kibwezi"],

  // NYANDARUA COUNTY
  "Kinangop": ["Engineer", "Gathara", "North Kinangop", "Murungaru", "Njabini/Kiburu"],
  "Kipipiri": ["Geta", "Githioro", "Kipipiri", "Wanjohi", "North Kinangop"],
  "Ol Kalou": ["Ol Kalou", "Kinangop", "Kaimbaga", "Rurii", "Gathanji"],
  "Ol Jorok": ["Mairo Inya", "Githioro", "Kipipiri", "Wanjohi", "Geta"],
  "Ndaragwa": ["Leshau/Pondo", "Kiriita", "Central", "Lanet/Umoja", "Bahati"],

  // NYERI COUNTY
  "Tetu": ["Dedan Kimathi", "Wamagana", "Aguthi", "Muringato", "Iriaini"],
  "Kieni": ["Mweiga", "Naromoru Kiamathaga", "Mwiyogo/Endarasha", "Mugunda", "Gatarakwa"],
  "Mathira": ["Karuri", "Gachika", "Kiamathaga", "Iriaini", "Ruguru"],
  "Othaya": ["Chinga", "Karima", "Mahiga", "Iria-ini", "Konyu"],
  "Mukurweini": ["Mukurweini Central", "Mukurweini West", "Gikondi", "Rugi", "Kiganjo/Mathari"],
  "Nyeri Town": ["Kiganjo/Mathari", "Rware", "Gatitu/Muruguru", "Ruring'u", "Kamakwa/Mukaro"],

  // KIRINYAGA COUNTY
  "Mwea": ["Thiba", "Kangai", "Njukiini", "Murinduko", "Gathigiriri", "Tebere"],
  "Gichugu": ["Kianyaga", "Kariti", "Murinduko", "Gathigiriri", "Tebere"],
  "Ndia": ["Baragwi", "Njukiini", "Gichugu", "Inoi", "Kanyekini"],
  "Kirinyaga Central": ["Mutithi", "Kangai", "Wamumu", "Nyangati", "Murinduko"],

  // MURANG'A COUNTY
  "Kangema": ["Kiharu", "Muruka", "Kangari", "Kinyona", "Kigumo"],
  "Mathioya": ["Kiriita", "Kangari", "Kinyona", "Muguru", "Rwathia"],
  "Kiharu": ["Kaharo", "Muruka", "Gaturi", "Muguru", "Rwathia"],
  "Kigumo": ["Kigumo", "Kangari", "Muguru", "Wangu", "Mbiri"],
  "Maragwa": ["Kambiti", "Kamahuha", "Kiharu", "Muruka", "Gaturi"],
  "Kandara": ["Gaichanjiru", "Ithiru", "Ruchu", "Kandara", "Muthithi"],
  "Gatanga": ["Kariara", "Nginda", "Gatanga", "Kihumbu-ini", "Kangari"],

  // KIAMBU COUNTY (Continued from earlier)
  "Gatundu South": ["Kiamwangi", "Kiganjo", "Ndarugu", "Ngenda"],
  "Gatundu North": ["Gatundu North", "Gatundu South", "Gituamba", "Githobokoni"],
  "Juja": ["Murera", "Theta", "Juja", "Witeithie", "Kalimoni"],
  "Thika Town": ["Township", "Kamenu", "Hospital", "Gatuanyaga", "Ngoliba"],
  "Ruiru": ["Githurai", "Kahawa Wendani", "Kahawa Sukari", "Kiuu", "Mwiki", "Mwihoko"],
  "Githunguri": ["Githunguri", "Githiga", "Ikinu", "Ngewa", "Komothai"],
  "Kiambaa": ["Cianda", "Karuri", "Ndenderu", "Muchatha", "Kihara"],
  "Kiambu Town": ["Township", "Riabai", "Gatuanyaga", "Kamenu", "Karai"],
  "Kabete": ["Nachu", "Sigona", "Kikuyu", "Karai", "Nderi"],
  "Kikuyu": ["Kinoo", "Kikuyu", "Karai", "Nachu"],
  "Limuru": ["Limuru Central", "Ndeiya", "Limuru East", "Ngecha Tigoni"],
  "Lari": ["Kinale", "Kijabe", "Nyanduma", "Kamburu", "Lari/Kirenga"],

  // TURKANA COUNTY
  "Turkana North": ["Kaeris", "Lake Zone", "Lapur", "Kaaleng/Kaikor", "Kibish", "Nakalale"],
  "Turkana West": ["Kakuma", "Lopur", "Letea", "Songot", "Kalobeyei", "Lokichogio"],
  "Turkana Central": ["Kanamkemer", "Kerio Delta", "Kang'atotha", "Kalokol", "Lodwar Township", "Songot"],
  "Loima": ["Kotaruk/Lobei", "Turkwell", "Loima", "Lokiriama/Lorengippi"],
  "Turkana South": ["Kaputir", "Katilu", "Lobokat", "Kalogoch", "Lokichar"],
  "Turkana East": ["Kapedo/Napeitom", "Katilia", "Lokori/Kochodin"],

  // WEST POKOT COUNTY
  "Kapenguria": ["Kapenguria", "Mnagei", "Siyoi", "Endugh", "Sook"],
  "Sigor": ["Kasei", "Kacheliba", "Kong'elai", "Weiwei", "Kipkomo"],
  "Kacheliba": ["Kasei", "Kacheliba", "Kong'elai", "Weiwei", "Kipkomo"],
  "Pokot South": ["Lelan", "Tapach", "Porkoyu", "Weiwei", "Kapchok"],

  // SAMBURU COUNTY
  "Samburu West": ["Suguta Marmar", "Maralal", "Loosuk", "Poro", "El Barta"],
  "Samburu North": ["Wamba West", "Wamba East", "Wamba North", "Waso", "El Barta"],
  "Samburu East": ["Waso", "Laisamis", "Korr/Ngurunit", "Logo Logo", "Loiyangalani"],

  // TRANS NZOIA COUNTY
  "Kwanza": ["Bidii", "Chepchoina", "Endebess", "Matumbei", "Tuigoin"],
  "Endebess": ["Endebess", "Matumbei", "Tuigoin", "Nabiswa", "Kakibora"],
  "Saboti": ["Machewa", "Kinyoro", "Rugunga", "Kiminini", "Waitaluk"],
  "Kiminini": ["Waitaluk", "Sirende", "Hospital", "Sikhendu", "Nabiswa"],
  "Cherangany": ["Chepchoina", "Endebess", "Matumbei", "Tuigoin", "Nabiswa"],

  // UASIN GISHU COUNTY
  "Soy": ["Kipsomba", "Soy", "Kubero", "Ziwa", "Segero/Barsombe"],
  "Turbo": ["Ngenyilel", "Tapsagoi", "Kamagut", "Kiplombe", "Kapsaos"],
  "Moiben": ["Kapsaos", "Tembelio", "Seretunin", "Cheptiret/Kipchamo", "Tulwet/Chuiyat"],
  "Ainabkoi": ["Kapseret", "Kipkenyo", "Ngeria", "Megun", "Langas"],
  "Kapseret": ["Megun", "Langas", "Racecourse", "Cheptiret/Kipchamo", "Tulwet/Chuiyat"],
  "Kesses": ["Tulwet/Chuiyat", "Tarakwa", "Kapyego", "Kaptagat", "Ainabkoi/Olare"],

  // ELGEYO/MARAKWET COUNTY
  "Marakwet East": ["Kapyego", "Tambach", "Kaptarakwa", "Chepkorio", "Soy North"],
  "Marakwet West": ["Soy North", "Soy South", "Kabiemit", "Metkei", "Songhor/Soba"],
  "Keiyo North": ["Tambach", "Kaptarakwa", "Chepkorio", "Soy North", "Metkei"],
  "Keiyo South": ["Metkei", "Songhor/Soba", "Kapkangani", "Kaptumo/Kaboi", "Koyo/Ndurio"],

  // NANDI COUNTY
  "Tinderet": ["Kabisaga", "Kapsabet", "Kilibwoni", "Chepterwai", "Kipkaren"],
  "Aldai": ["Kabiyet", "Ndalat", "Kabisaga", "Kapsabet", "Kilibwoni"],
  "Nandi Hills": ["Chepkunyuk", "Ol'lessos", "Kapchorua", "Kaimosi", "Kibwareng"],
  "Chesumei": ["Kapsabet", "Kilibwoni", "Chepterwai", "Kipkaren", "Kapsimotwo"],
  "Emgwen": ["Kapsabet", "Kilibwoni", "Chepterwai", "Kipkaren", "Kapsimotwo"],
  "Mosop": ["Kapsimotwo", "Kaptel/Kamoiywo", "Kiptuya", "Chepkumia", "Kapkangani"],

  // BARINGO COUNTY
  "Tiaty": ["Kolowa", "Ribkwo", "Silale", "Loiyamorok", "Tangulbei/Korossi"],
  "Baringo North": ["Saimo/Kipsaraman", "Saimo/Soi", "Bartabwa", "Kabartonjo", "Sacho"],
  "Baringo Central": ["Sacho", "Kabartonjo", "Bartabwa", "Kapropita", "Marigat"],
  "Baringo South": ["Marigat", "Mochongoi", "Mukutani", "Emining", "Lembus"],
  "Mogotio": ["Emining", "Lembus", "Mukutani", "Mogotio", "Ravine"],
  "Eldama Ravine": ["Ravine", "Mumberes/Maji Mazuri", "Lembus Kwen", "Koibatek", "Embobut/Embolot"],

  // LAIKIPIA COUNTY
  "Laikipia West": ["Ol-Moran", "Rumuruti Township", "Githiga", "Marmanet", "Igwamiti"],
  "Laikipia East": ["Ngobit", "Tigithi", "Thingithu", "Nanyuki", "Umande"],
  "Laikipia North": ["Sosian", "Segera", "Mukogodo West", "Mukogodo East", "Igwamiti"],

  // NAKURU COUNTY (Continued from earlier)
  "Molo": ["Molo", "Elburgon", "Mariashoni", "Turi"],
  "Njoro": ["Njoro", "Mauche", "Kihingo", "Nessuit", "Lare", "Mau Narok"],
  "Naivasha": ["Naivasha East", "Naivasha West", "Maella", "Biashara", "Kihoto", "Lake View"],
  "Gilgil": ["Gilgil", "Elementaita", "Mbaruk/Eburu", "Malewa West", "Murindati"],
  "Kuresoi South": ["Keringet", "Kiptagich", "Tinet", "Kiptororo"],
  "Kuresoi North": ["Sirikwa", "Kamara", "Kapkures", "Kiptororo"],
  "Subukia": ["Subukia", "Waseges", "Kabazi", "Mogotio"],
  "Rongai": ["Solai", "Mosop", "Moi's Bridge", "Kapkangani", "Rongai"],
  "Bahati": ["Bahati", "Dundori", "Kabatini", "Kiamaina", "Lanet/Umoja"],
  "Nakuru Town West": ["Barut", "London", "Kaptembwo", "Kapkures", "Rhoda", "Shaabab"],
  "Nakuru Town East": ["Biashara", "Kivumbini", "Flamingo", "Menengai", "Nakuru East"],

  // NAROK COUNTY
  "Kilgoris": ["Kilgoris Central", "Keyian", "Angata Barikoi", "Shankoe", "Kimintet"],
  "Emurua Dikirr": ["Ilkerin", "Ololmasani", "Mogondo", "Kapsasian"],
  "Narok North": ["Ololulung'a", "Mara", "Siana", "Narosura", "Melili"],
  "Narok East": ["Suswa", "Majimoto/Naroosura", "Ololulung'a", "Melelo", "Loita"],
  "Narok South": ["Melelo", "Loita", "Sogoo", "Sagamian", "Ilmotiok"],
  "Narok West": ["Mogondo", "Ilkerin", "Ololmasani", "Kapsasian", "Sogoo"],

  // KAJIADO COUNTY
  "Kajiado North": ["Ongata Rongai", "Nkaimurunya", "Oloolua", "Ngong", "Matasia"],
  "Kajiado Central": ["Ildamat", "Dalalekutuk", "Matapato North", "Matapato South", "Kaputiei North"],
  "Kajiado East": ["Kaputiei North", "Kitengela", "Oloosirkon/Sholinke", "Kenyawa-Poka", "Imaroro"],
  "Kajiado West": ["Kajiado", "Iloodokilani", "Magadi", "Ewuaso Oonkidong'i", "Keek-Onyokie"],
  "Kajiado South": ["Purko", "Ildamat", "Dalalekutuk", "Matapato North", "Matapato South"],

  // KERICHO COUNTY
  "Kipkelion East": ["Londiani", "Kedowa/Kimugul", "Chepseon", "Tendeno/Sorget"],
  "Kipkelion West": ["Kunyak", "Kamasian", "Kipkelion", "Chilchila"],
  "Ainamoi": ["Kapsoit", "Ainamoi", "Kapkugerwet", "Kipchebor", "Kapsaos"],
  "Bureti": ["Cheborge", "Kipreres", "Sigowet", "Kapkatet", "Soliat"],
  "Belgut": ["Londiani", "Kedowa/Kimugul", "Chepseon", "Tendeno/Sorget"],
  "Sigowet/Soin": ["Sigowet", "Soin", "Kaplelartet", "Soliat", "Roret"],

  // BOMET COUNTY
  "Sotik": ["Sotik", "Chepalungu", "Konoin", "Bomet East", "Bomet Central"],
  "Chepalungu": ["Sigor", "Chebunyo", "Nyongores", "Sigor", "Mutarakwa"],
  "Bomet East": ["Merigi", "Kembu", "Longisa", "Kipreres", "Chemaner"],
  "Bomet Central": ["Silibwet", "Singorwet", "Ndaraweta", "Bonet", "Chesoen"],
  "Konoin": ["Embomos", "Mogogosiek", "Boito", "Embobut", "Kapsowar"],

  // KAKAMEGA COUNTY (Continued from earlier)
  "Lugari": ["Mautuma", "Lugari", "Lumakanda", "Chekalini", "Lwandeti"],
  "Likuyani": ["Sango", "Kongoni", "Nzoia", "Sinoko", "Likuyani"],
  "Malava": ["Malava", "Lurambi North", "Lurambi South", "Malaha", "South Kabras", "North Kabras", "Butali/Chegulo"],
  "Lurambi": ["Shinoyi-Shikomari", "Lurambi East", "Lurambi West", "Manda/Shivanga", "Sheywe"],
  "Navakholo": ["Ingostre-Mathia", "Shinamwenyuli", "Bunyala West", "Bunyala East", "Bunyala Central"],
  "Mumias West": ["Mumias Central", "Mumias North", "Etenje", "Musanda"],
  "Mumias East": ["Lusheya/Lubinu", "Malaha/Isongo/Makunga", "East Wanga"],
  "Matungu": ["Kholera", "Khalaba", "Mayoni", "Namamali"],
  "Butere": ["Marama West", "Marama Central", "Marenyo-Shianda", "West Butere", "Central Butere", "Butere"],
  "Khwisero": ["Emakina", "Butsotso East", "Butsotso South", "Butsotso Central", "Butsotso North"],
  "Shinyalu": ["Shinyalu", "Musikoma", "East Sang'alo", "Marakaru/Tuuti", "West Sang'alo"],
  "Ikolomani": ["Idakho East", "Idakho South", "Idakho Central", "Idakho North"],

  // VIHIGA COUNTY
  "Vihiga": ["Luanda", "Wemilabi", "Muhudu", "Tambua", "Jepkoyai"],
  "Sabatia": ["Chavakali", "North Maragoli", "Wodanga", "Busali", "Shiru"],
  "Hamisi": ["Shamakhokho", "Banja", "Muhudu", "Tambua", "Jepkoyai"],
  "Luanda": ["Luanda", "Wemilabi", "Muhudu", "Tambua", "Jepkoyai"],
  "Emuhaya": ["North East Bunyore", "Central Bunyore", "West Bunyore", "Cheptais", "Kapsokwony"],

  // BUNGOMA COUNTY
  "Mt. Elgon": ["Cheptais", "Kapsokwony", "Kopsiro", "Kaptama", "Chepyuk"],
  "Sirisia": ["Kabuchai", "Chwele", "Bokoli", "Mukuyuni", "Misikhu"],
  "Kabuchai": ["Kabuchai", "Chwele", "Bokoli", "Mukuyuni", "Misikhu"],
  "Bumula": ["Kimaeti", "Bukembe West", "Bukembe East", "Township", "Mukwa"],
  "Kanduyi": ["Bukembe West", "Bukembe East", "Township", "Mukwa", "South Bukusu"],
  "Webuye East": ["Mihuu", "Ndivisi", "Maraka", "Misikhu", "Bokoli"],
  "Webuye West": ["Bukembe West", "Bukembe East", "Township", "Mukwa", "South Bukusu"],
  "Kimilili": ["Kimilili", "Maeni", "Kamukuywa", "Kibingei", "Township"],
  "Tongaren": ["Tongaren", "Soysambu/Mitua", "Kabuyefwe", "Naitiri/Kabuyefwe", "Bukembe"],

  // BUSIA COUNTY
  "Teso North": ["Ang'urai South", "Ang'urai North", "Ang'urai East", "Malaba Central", "Malaba North"],
  "Teso South": ["Ang'urai South", "Ang'urai North", "Ang'urai East", "Malaba Central", "Malaba North"],
  "Nambale": ["Bukhayo North/Walatsi", "Bukhayo Central", "Bukhayo East", "Nambale Township", "Bukhayo West"],
  "Matayos": ["Budalangi", "Bunyala Central", "Bunyala North", "Bunyala West", "Bunyala South"],
  "Butula": ["Marachi West", "Marachi Central", "Marachi East", "Marachi North", "Elugulu"],
  "Funyula": ["Budalangi", "Bunyala Central", "Bunyala North", "Bunyala West", "Bunyala South"],
  "Budalangi": ["Budalangi", "Bunyala Central", "Bunyala North", "Bunyala West", "Bunyala South"],

  // SIAYA COUNTY
  "Ugenya": ["Sidindi", "Sigomere", "Ugunja", "Ukwala", "Sega"],
  "Ugunja": ["Ugunja", "Sega", "Sidindi", "Sigomere", "Ukwala"],
  "Alego Usonga": ["Usonga", "North Alego", "Central Alego", "Siaya Township", "West Alego"],
  "Gem": ["East Gem", "West Gem", "North Gem", "South Gem", "Central Gem"],
  "Bondo": ["West Yimbo", "Central Sakwa", "South Sakwa", "Yimbo East", "West Sakwa"],
  "Rarieda": ["East Asembo", "West Asembo", "North Uyoma", "South Uyoma", "West Uyoma"],

  // KISUMU COUNTY (Continued from earlier)
  "Kisumu East": ["Kajulu", "Kolwa East", "Manyatta 'B'", "Nyalenda 'A'", "Nyalenda 'B'"],
  "Kisumu West": ["Kisumu North", "West Kisumu", "North West Kisumu", "Central Kisumu"],
  "Kisumu Central": ["Kajulu", "Kakola/Kaburini", "Kondele", "Milimani", "Nyalenda 'A'", "Nyalenda 'B'"],
  "Seme": ["West Seme", "Central Seme", "East Seme", "North Seme"],
  "Nyando": ["Kakola", "South West Nyakach", "North Nyakach", "Central Nyakach", "South Nyakach"],
  "Muhoroni": ["Muhoroni/Koru", "South West Nyakach", "Nyakach", "Lower Nyakach", "Upper Nyakach"],
  "Nyakach": ["Lower Nyakach", "Central Nyakach", "Upper Nyakach", "South East Nyakach", "West Nyakach"],

  // HOMA BAY COUNTY
  "Kasipul": ["West Kasipul", "South Kasipul", "Central Kasipul", "East Kamagak", "West Kamagak"],
  "Kabondo Kasipul": ["Kabondo East", "Kabondo West", "Kokwanyo/Kakelo", "Kojwach", "West Karachuonyo"],
  "Karachuonyo": ["Kanyaluo", "Kibiri", "Wang'chieng", "Kendu Bay Town", "West Karachuonyo"],
  "Rangwe": ["Kanyikela", "North Kabuoch", "Kabuoch South/Pala", "Kanyamwa Kologi", "Kanyamwa Kosewe"],
  "Homa Bay Town": ["Homa Bay Central", "Homa Bay Arujo", "Homa Bay West", "Homa Bay East"],
  "Ndhiwa": ["Kanyikela", "North Kabuoch", "Kabuoch South/Pala", "Kanyamwa Kologi", "Kanyamwa Kosewe"],
  "Suba North": ["Gembe", "Lambwe", "Gwassi South", "Gwassi North", "Kaksingri West"],
  "Suba South": ["Gwassi South", "Gwassi North", "Kaksingri West", "Kaksingri East", "Mfangano"],

  // MIGORI COUNTY
  "Rongo": ["North Kamagambo", "Central Kamagambo", "East Kamagambo", "South Kamagambo", "West Kamagambo"],
  "Awendo": ["North East Sakwa", "South Sakwa", "West Sakwa", "Central Sakwa", "God Jope"],
  "Suna East": ["Kakrao", "Kwa", "Central Kanyamkago", "South Kanyamkago", "East Kanyamkago"],
  "Suna West": ["West Kanyamkago", "North Kanyamkago", "Central Kanyamkago", "South Kanyamkago", "East Kanyamkago"],
  "Uriri": ["Central Kanyamkago", "South Kanyamkago", "East Kanyamkago", "West Kanyamkago", "North Kanyamkago"],
  "Nyatike": ["Kanyasa", "North Kadem", "Macalder/Kanyarwanda", "Kaler", "Got Kachola"],
  "Kuria East": ["Bukira East", "Bukira Central/Ikerege", "Isibania", "Makerero", "Masaba"],
  "Kuria West": ["Bukira East", "Bukira Central/Ikerege", "Isibania", "Makerero", "Masaba"],

  // KISII COUNTY
  "Bonchari": ["Bogiakumu", "Bomorenda", "Bomorianga", "Bogusero", "Bokeira"],
  "South Mugirango": ["Bomorenda", "Bomorianga", "Bogusero", "Bokeira", "Bomachoge"],
  "Bomachoge Borabu": ["Bomorenda", "Bomorianga", "Bogusero", "Bokeira", "Bomachoge"],
  "Bobasi": ["Bobasi Chache", "Bobasi Boitangare", "Bomorenda", "Bomorianga", "Bogusero"],
  "Bomachoge Chache": ["Bomorenda", "Bomorianga", "Bogusero", "Bokeira", "Bomachoge"],
  "Nyaribari Masaba": ["Masige East", "Masige West", "Bomorenda", "Bomorianga", "Bogusero"],
  "Nyaribari Chache": ["Bomorenda", "Bomorianga", "Bogusero", "Bokeira", "Bomachoge"],
  "Kitutu Chache North": ["Bomorenda", "Bomorianga", "Bogusero", "Bokeira", "Bomachoge"],
  "Kitutu Chache South": ["Bomorenda", "Bomorianga", "Bogusero", "Bokeira", "Bomachoge"],

  // NYAMIRA COUNTY
  "Kitutu Masaba": ["Bomorenda", "Bomorianga", "Bogusero", "Bokeira", "Bomachoge"],
  "West Mugirango": ["Bomorenda", "Bomorianga", "Bogusero", "Bokeira", "Bomachoge"],
  "North Mugirango": ["Bomorenda", "Bomorianga", "Bogusero", "Bokeira", "Bomachoge"],
  "Borabu": ["Bomorenda", "Bomorianga", "Bogusero", "Bokeira", "Bomachoge"],

  // NAIROBI COUNTY (Continued from earlier)
  "Westlands": ["Kitisuru", "Parklands/Highridge", "Karura", "Kangemi", "Mountain View"],
  "Dagoretti North": ["Kilimani", "Kawangware", "Gatina", "Kileleshwa", "Kabiro"],
  "Dagoretti South": ["Mutu-ini", "Ngando", "Riruta", "Uthiru/Ruthimitu", "Waithaka"],
  "Langata": ["Karen", "Nairobi West", "Mugumo-ini", "South C", "Nyayo Highrise"],
  "Kibra": ["Laini Saba", "Lindi", "Makina", "Woodley/Kenyatta Golf Course", "Sarang'ombe"],
  "Roysambu": ["Roysambu", "Kasarani", "Kahawa West", "Zimmerman", "Kahawa"],
  "Kasarani": ["Clay City", "Mwiki", "Kasarani", "Njiru", "Ruai"],
  "Ruaraka": ["Babadogo", "Utalii", "Mathare North", "Lucky Summer", "Korogocho"],
  "Embakasi South": ["Imara Daima", "Kwa Njenga", "Kwa Reuben", "Pipeline", "Kware"],
  "Embakasi North": ["Kariobangi North", "Dandora Area I", "Dandora Area II", "Dandora Area III", "Dandora Area IV"],
  "Embakasi Central": ["Kayole North", "Kayole Central", "Kayole South", "Komarock", "Matopeni"],
  "Embakasi East": ["Upper Savanna", "Lower Savanna", "Embakasi", "Utawala", "Mihang'o"],
  "Embakasi West": ["Umoja I", "Umoja II", "Mowlem", "Kariobangi South"],
  "Makadara": ["Maringo/Hamza", "Viwandani", "Harambee", "Makongeni", "Mbotela"],
  "Kamukunji": ["Pumwani", "Eastleigh North", "Eastleigh South", "Airbase", "California"],
  "Starehe": ["Nairobi Central", "Ngara", "Pangani", "Ziwani/Kariokor", "Landimawe", "Nairobi South"],
  "Mathare": ["Hospital", "Mabatini", "Huruma", "Ngei", "Mlango Kubwa", "Kiamaiko"]
};

// Polling Stations by Ward (Sample)
const pollingStationsByWard = {
  // Sample polling stations for Nairobi wards
  "Kitisuru": [
    "Kitisuru Primary School", 
    "Kitisuru Social Hall", 
    "Kitisuru Chief's Office",
    "Kitisuru Baptist Church",
    "Kitisuru Secondary School"
  ],
  "Parklands/Highridge": [
    "Parklands Baptist Church", 
    "Aga Khan Primary School", 
    "Hillcrest Secondary School",
    "Parklands Sports Club",
    "St. Austin's Academy"
  ],
  "Karen": [
    "Karen Primary School", 
    "Karen Shopping Centre", 
    "Dagoretti Corner",
    "Boma Hotel Karen",
    "Karen Hardy Primary"
  ],
  "Nairobi West": [
    "Nairobi West Primary", 
    "Nairobi West Social Hall", 
    "Tumaini Primary",
    "Ushirika Primary",
    "Jamhuri Primary"
  ],
  
  // Sample polling stations for Mombasa
  "Port Reitz": [
    "Port Reitz Primary School", 
    "Mikindani Secondary School", 
    "Port Reitz Hospital",
    "Port Reitz Catholic Church", 
    "Mikindani Social Hall"
  ],
  "Kipevu": [
    "Kipevu Primary School", 
    "Kipevu Secondary School", 
    "Magongo Health Centre",
    "Kipevu Social Hall", 
    "Kipevu Chief's Camp"
  ],
  
  // Sample for Kiambu
  "Githunguri": [
    "Githunguri Primary School", 
    "Githunguri Secondary School", 
    "Githunguri Health Centre",
    "Githunguri Market", 
    "Githunguri Chief's Office"
  ],
  "Githiga": [
    "Githiga Primary School", 
    "Githiga Secondary School", 
    "Githiga Health Centre",
    "Githiga Market", 
    "Githiga Church"
  ],
  
  // Sample for Kisumu
  "Kajulu": [
    "Kajulu Primary School", 
    "Kajulu Secondary School", 
    "Kajulu Health Centre",
    "Kajulu Chief's Office", 
    "Kajulu Market"
  ],
  "Manyatta 'B'": [
    "Manyatta Primary School", 
    "Manyatta Social Hall", 
    "Manyatta Health Centre",
    "Manyatta Chief's Office", 
    "Manyatta Market"
  ],
  
  // Add polling stations for all other wards...
};

const VoterDriveSection = ({ showThankYou: initialShowThankYou = false }: VoterDriveSectionProps) => {
  const [showThankYou, setShowThankYou] = useState(initialShowThankYou);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    county: "",
    constituency: "",
    ward: "",
    pollingStation: "",
    interests: [] as string[],
    additionalInfo: "",
  });

  // Get constituencies for selected county
  const getConstituenciesForCounty = (county: string) => {
    return constituenciesByCounty[county] || [];
  };

  // Get wards for selected constituency
  const getWardsForConstituency = (constituency: string) => {
    return wardsByConstituency[constituency] || [];
  };

  // Get polling stations for selected ward
  const getPollingStationsForWard = (ward: string) => {
    return pollingStationsByWard[ward] || [];
  };

  const interests = [
    "Fund Raising / Donating",
    "Civic Education",
    "Community Organization",
    "Issue Based Organizing",
    "Digital Organizing",
    "Volunteer Recruitment & Training",
    "Voter Registration",
    "Election Monitoring",
    "Youth Mobilization",
    "Women Empowerment"
  ];

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interest]
        : prev.interests.filter(i => i !== interest)
    }));
  };

  const handleCountyChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      county: value,
      constituency: "",
      ward: "",
      pollingStation: ""
    }));
  };

  const handleConstituencyChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      constituency: value,
      ward: "",
      pollingStation: ""
    }));
  };

  const handleWardChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      ward: value,
      pollingStation: ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    
    if (!fullName || !formData.email || !formData.phone) {
      toast.error("Please fill in your name, email, and phone number");
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.county || !formData.constituency) {
      toast.error("Please select your county and constituency");
      setIsSubmitting(false);
      return;
    }
    
    try {
      const { error } = await supabase
        .from("volunteers")
        .insert({
          name: fullName,
          email: formData.email,
          phone: formData.phone,
          county: formData.county,
          constituency: formData.constituency,
          ward: formData.ward || null,
          polling_station: formData.pollingStation || null,
          interests: formData.interests,
          additional_info: formData.additionalInfo || null,
          status: "pending",
          created_at: new Date().toISOString(),
        });
      
      if (error) {
        console.error("Error submitting volunteer form:", error);
        toast.error("Failed to submit. Please try again.");
        setIsSubmitting(false);
        return;
      }
      
      toast.success("Thank you for volunteering! We'll contact you soon.");
      setShowThankYou(true);
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        county: "",
        constituency: "",
        ward: "",
        pollingStation: "",
        interests: [],
        additionalInfo: "",
      });
      
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showThankYou) {
    return <ThankYouVolunteer />;
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-emerald-50 via-white to-teal-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full mb-4">
            <span className="text-sm font-medium text-emerald-700">Get Involved</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Join Voter Drive Movement
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Be part of the change Kenya needs. Your voice and action can help Reset, 
            Restore, and Rebuild our nation for a better tomorrow.
          </p>
        </div>

        {/* Form Card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4">
                <span className="text-2xl">🗳️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Voter Drive Registration
              </h3>
              <p className="text-gray-600">
                Fill out the form below to join thousands of Kenyans working to bring 
                positive change to our country.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                  Personal Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                      placeholder="Enter first name"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                      placeholder="Enter last name"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📱 Phone Number *
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                      placeholder="+254 7XX XXX XXX"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ✉️ Email Address *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      placeholder="your.email@example.com"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                  📍 Location Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      County *
                    </label>
                    <Select 
                      value={formData.county} 
                      onValueChange={handleCountyChange}
                      required
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select county" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {kenyanCounties.map((county) => (
                          <SelectItem key={county} value={county}>
                            {county}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Constituency *
                    </label>
                    <Select 
                      value={formData.constituency} 
                      onValueChange={handleConstituencyChange}
                      disabled={!formData.county}
                      required
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={
                          !formData.county 
                            ? "Select county first" 
                            : `Select constituency in ${formData.county}`
                        } />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {getConstituenciesForCounty(formData.county).map((constituency) => (
                          <SelectItem key={constituency} value={constituency}>
                            {constituency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ward
                    </label>
                    <Select 
                      value={formData.ward} 
                      onValueChange={handleWardChange}
                      disabled={!formData.constituency}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={
                          !formData.constituency 
                            ? "Select constituency first" 
                            : `Select ward in ${formData.constituency}`
                        } />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {getWardsForConstituency(formData.constituency).map((ward) => (
                          <SelectItem key={ward} value={ward}>
                            {ward}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Polling Station
                    </label>
                    <Select 
                      value={formData.pollingStation} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, pollingStation: value }))}
                      disabled={!formData.ward}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={
                          !formData.ward 
                            ? "Select ward first" 
                            : `Select polling station in ${formData.ward}`
                        } />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {getPollingStationsForWard(formData.ward).map((station) => (
                          <SelectItem key={station} value={station}>
                            {station}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Voter Drive Interests */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                  🗳️ Voter Drive Interests
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {interests.map((interest) => (
                    <label 
                      key={interest}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-emerald-50/50 transition-colors group"
                    >
                      <Checkbox
                        checked={formData.interests.includes(interest)}
                        onCheckedChange={(checked) => handleInterestChange(interest, checked as boolean)}
                        className="border-gray-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">
                        {interest}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                  💬 Additional Information
                </h4>
                <label className="block text-sm text-gray-600 mb-2">
                  Tell us more about yourself (optional)
                </label>
                <Textarea
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  placeholder="Share any additional information, skills, or experience that might be relevant to your volunteer work..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Terms and Conditions */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox required className="mt-1" />
                  <div className="text-sm text-gray-600">
                    I agree to the terms and conditions of volunteering. I understand that my information 
                    will be used for voter mobilization purposes only and I consent to receiving 
                    communication about voter drive activities.
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Join the Voter Drive Movement 🚀"
                )}
              </Button>
            </form>

            {/* Privacy Notice */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Your information is secure and will only be used for voter mobilization purposes. 
                We respect your privacy and will never share your data without your consent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VoterDriveSection;
