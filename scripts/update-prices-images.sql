UPDATE accounts
SET price = '550.00',
    old_price = '580.00',
    images = ARRAY[
      'https://res.cloudinary.com/doorrysnw/image/upload/v1789645541/IMG-20260917-WA0032_xsmeck.jpg',
      'https://res.cloudinary.com/doorrysnw/image/upload/v1789645540/IMG-20260917-WA0029_dv1y4m.jpg',
      'https://res.cloudinary.com/doorrysnw/image/upload/v1789645541/IMG-20260917-WA0030_n3vnp9.jpg',
      'https://res.cloudinary.com/doorrysnw/image/upload/v1789645541/IMG-20260917-WA0031_lzibgy.jpg',
      'https://res.cloudinary.com/doorrysnw/image/upload/v1789645542/IMG-20260917-WA0033_zy9lrl.jpg',
      'https://res.cloudinary.com/doorrysnw/image/upload/v1789645540/IMG-20260917-WA0034_rsae3i.jpg',
      'https://res.cloudinary.com/doorrysnw/image/upload/v1789645540/IMG-20260917-WA0035_fubaof.jpg',
      'https://res.cloudinary.com/doorrysnw/image/upload/v1789645539/IMG-20260917-WA0036_djysp3.jpg'
    ],
    whatsapp_message = 'قرية كلاش تاون 18 ليفل 257 سعر 550'
WHERE slug = 'coc-th18-l257';

UPDATE accounts
SET images = ARRAY[
      'https://res.cloudinary.com/doorrysnw/image/upload/v1789645548/IMG-20260917-WA0010_vn9uny.jpg',
      'https://res.cloudinary.com/doorrysnw/image/upload/v1789645550/IMG-20260917-WA0004_rvihmq.jpg',
      'https://res.cloudinary.com/doorrysnw/image/upload/v1789645548/IMG-20260917-WA0005_vrstbr.jpg',
      'https://res.cloudinary.com/doorrysnw/image/upload/v1789645549/IMG-20260917-WA0006_awvo8q.jpg',
      'https://res.cloudinary.com/doorrysnw/image/upload/v1789645549/IMG-20260917-WA0007_qs6rif.jpg',
      'https://res.cloudinary.com/doorrysnw/image/upload/v1789645550/IMG-20260917-WA0008_d84nkp.jpg',
      'https://res.cloudinary.com/doorrysnw/image/upload/v1789645549/IMG-20260917-WA0009_esi2az.jpg'
    ]
WHERE slug = 'coc-th18-l256';
