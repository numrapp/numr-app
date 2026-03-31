export interface ChatMessage {
  id: number;
  fromMe: boolean;
  time: string;
  translations: Record<string, string>;
}

export interface ChatThread {
  id: number;
  company: string;
  logo: string;
  logoBg: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: ChatMessage[];
}

export const mockChats: ChatThread[] = [
  {
    id: 1, company: 'Van der Berg Bouw BV', logo: 'VB', logoBg: '#F59E0B',
    lastMessage: 'Ja, wij kunnen volgende week beginnen.', lastTime: '14:32', unread: 1,
    messages: [
      { id: 1, fromMe: true, time: '14:20', translations: { nl: 'Hallo, ik heb uw video gezien. Kunt u een offerte maken?', tr: 'Merhaba, videonuzu gordum. Teklif verebilir misiniz?', en: 'Hello, I saw your video. Can you make a quote?', ar: 'مرحبا، رأيت الفيديو. هل يمكنك تقديم عرض أسعار؟', bg: 'Здравейте, видях видеото ви. Можете ли да направите оферта?', pl: 'Witam, widzialem wasz film. Czy mozecie przygotowac oferte?' } },
      { id: 2, fromMe: false, time: '14:32', translations: { nl: 'Ja, wij kunnen volgende week beginnen. Wat voor project is het?', tr: 'Evet, gelecek hafta baslayabiliriz. Ne tur bir proje?', en: 'Yes, we can start next week. What kind of project is it?', ar: 'نعم، يمكننا البدء الأسبوع القادم. ما نوع المشروع؟', bg: 'Да, можем да започнем следващата седмица. Какъв проект е?', pl: 'Tak, mozemy zaczac w przyszlym tygodniu. Jaki to projekt?' } },
    ],
  },
  {
    id: 2, company: 'Amsterdam Taxi Service', logo: 'AT', logoBg: '#16A34A',
    lastMessage: 'Wij rijden 24/7, ook in het weekend.', lastTime: '12:15', unread: 0,
    messages: [
      { id: 1, fromMe: true, time: '12:00', translations: { nl: 'Goedemiddag, rijdt u ook naar Schiphol?', tr: 'Iyi gunler, Schiphol\'a da gidiyor musunuz?', en: 'Good afternoon, do you also drive to Schiphol?', ar: 'مساء الخير، هل تقودون إلى سخيبول أيضاً؟', bg: 'Добър ден, возите ли и до Схипхол?', pl: 'Dzien dobry, czy jezdza Panstwo takze na Schiphol?' } },
      { id: 2, fromMe: false, time: '12:10', translations: { nl: 'Ja zeker! Vaste prijs €45 vanaf Amsterdam Centrum.', tr: 'Elbette! Amsterdam Centrum\'dan sabit fiyat €45.', en: 'Yes of course! Fixed price €45 from Amsterdam Centre.', ar: 'بالتأكيد! سعر ثابت 45 يورو من وسط أمستردام.', bg: 'Да, разбира се! Фиксирана цена €45 от центъра на Амстердам.', pl: 'Oczywiscie! Stala cena 45 euro z centrum Amsterdamu.' } },
      { id: 3, fromMe: false, time: '12:15', translations: { nl: 'Wij rijden 24/7, ook in het weekend.', tr: 'Hafta sonu dahil 7/24 calisiyoruz.', en: 'We drive 24/7, including weekends.', ar: 'نقود 24/7، بما في ذلك عطلات نهاية الأسبوع.', bg: 'Возим 24/7, включително през уикендите.', pl: 'Jezdzimy 24/7, rowniez w weekendy.' } },
    ],
  },
  {
    id: 3, company: 'Holland Transport BV', logo: 'HT', logoBg: '#EA580C',
    lastMessage: 'De prijs hangt af van het gewicht.', lastTime: 'Gisteren', unread: 2,
    messages: [
      { id: 1, fromMe: true, time: '16:00', translations: { nl: 'Hallo, wat kost transport naar Duitsland?', tr: 'Merhaba, Almanya\'ya nakliye ne kadar?', en: 'Hello, how much does transport to Germany cost?', ar: 'مرحبا، كم تكلفة النقل إلى ألمانيا؟', bg: 'Здравейте, колко струва транспорт до Германия?', pl: 'Witam, ile kosztuje transport do Niemiec?' } },
      { id: 2, fromMe: false, time: '16:30', translations: { nl: 'De prijs hangt af van het gewicht en de afmetingen.', tr: 'Fiyat agirliga ve boyutlara baglidir.', en: 'The price depends on weight and dimensions.', ar: 'يعتمد السعر على الوزن والأبعاد.', bg: 'Цената зависи от теглото и размерите.', pl: 'Cena zalezy od wagi i wymiarow.' } },
    ],
  },
];
