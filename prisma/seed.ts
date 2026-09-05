import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const userPassword = await bcrypt.hash("user123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@glowandbeauty.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@glowandbeauty.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Sarah Beauty",
      email: "user@example.com",
      password: userPassword,
      role: "USER",
    },
  });

  console.log(`Created admin: ${admin.email}`);
  console.log(`Created user: ${user.email}`);

  const products = [
    {
      name: "IPL 02",
      description: "جهاز ليزر منزلي اقتصادي وعملي لإزالة الشعر، بـ 999,999 ومضة، 5 مستويات طاقة، تبريد عالي، ووضع تلقائي ذكي لراحة أكبر ونتائج تدريجية مع الاستمرار.",
      price: 18000.00,
      comparePrice: null,
      images: JSON.stringify(["/images/IPL-02.png"]),
      category: "beauty-devices",
      subcategory: "Hair Removal",
      brand: "IPL",
      ingredients: null,
      howToUse: "استخدم الجهاز على البشرة النظيفة والجافة. ابدأ بأدنى مستوى طاقة وزد تدريجياً حسب راحة البشرة. استخدم 2-3 مرات أسبوعياً للحصول على نتائج مثالية.",
      stock: 50,
      featured: true,
      variants: {
        create: [
          { name: "IPL 02", price: 18000.00, stock: 50, sku: "IPL-02-001" },
        ],
      },
    },
    {
      name: "IPL 03",
      description: "جهاز ليزر منزلي متطور لإزالة الشعر والعناية بالبشرة، يحتوي على 999,999 ومضة، 9 مستويات طاقة، و3 أوضاع ذكية HR / FR / SR للشعر، النضارة، وتحسين مظهر البشرة. مزود بخاصية التبريد ووضع تلقائي ذكي لتجربة أسهل وأكثر راحة، مع نتائج تدريجية لبشرة أنعم مع الاستمرار.",
      price: 29500.00,
      comparePrice: null,
      images: JSON.stringify(["/images/IPL-03.png"]),
      category: "beauty-devices",
      subcategory: "Hair Removal",
      brand: "YR Multicharm",
      ingredients: null,
      howToUse: "استخدم الجهاز على البشرة النظيفة والجافة. ابدأ بأدنى مستوى طاقة وزد تدريجياً حسب راحة البشرة. استخدم الوضع المناسب حسب المنطقة: HR للشعر، FR للنضارة، SR لتحسين مظهر البشرة.",
      stock: 50,
      featured: true,
      variants: {
        create: [
          { name: "IPL 03", price: 29500.00, stock: 50, sku: "IPL-03-001" },
        ],
      },
    },
    {
      name: "Acura 99",
      description: "جهاز IPL منزلي لإزالة الشعر بتقنية الضوء النبضي، مصمم لاستعمال سهل ومريح من المنزل. يحتوي على 999,999 ومضة، مع خاصية التبريد لتجربة ألطف على البشرة، ويأتي مع نظارات حماية وشفرة تحضير للاستعمال العملي. خيار مناسب لمن تبحث عن جهاز اقتصادي وفعال للعناية المنتظمة بالبشرة.",
      price: 31000.00,
      comparePrice: null,
      images: JSON.stringify(["/images/acura-99.jpg"]),
      category: "beauty-devices",
      subcategory: "Hair Removal",
      brand: "Acura",
      ingredients: null,
      howToUse: "استخدم الجهاز على البشرة النظيفة والجافة. ابدأ بأدنى مستوى طاقة وزد تدريجياً حسب راحة البشرة. استخدم 2-3 مرات أسبوعياً للحصول على نتائج مثالية.",
      stock: 50,
      featured: true,
      variants: {
        create: [
          { name: "Acura 99", price: 31000.00, stock: 50, sku: "ACR-99-001" },
        ],
      },
    },
    {
      name: "MLAY T14",
      description: "جهاز منزلي لإزالة الشعر IPL، عملي وسهل الاستعمال، يحتوي على 500,000 ومضة، 5 مستويات طاقة، برمجة أوتوماتيكية وخاصية التبريد لتجربة أكثر راحة. مناسب للعناية المنتظمة من المنزل ويساعد على تقليل نمو الشعر تدريجياً مع الاستمرار.",
      price: 35000.00,
      comparePrice: null,
      images: JSON.stringify(["/images/mlay-t14.jpg"]),
      category: "beauty-devices",
      subcategory: "Hair Removal",
      brand: "MLAY",
      ingredients: null,
      howToUse: "استخدم الجهاز على البشرة النظيفة والجافة. ابدأ بأدنى مستوى طاقة وزد تدريجياً حسب راحة البشرة. استخدم 2-3 مرات أسبوعياً للحصول على نتائج مثالية.",
      stock: 50,
      featured: true,
      variants: {
        create: [
          { name: "MLAY T14", price: 35000.00, stock: 50, sku: "MLAY-T14-001" },
        ],
      },
    },
    {
      name: "MLAY T16",
      description: "جهاز IPL منزلي لإزالة الشعر، بتصميم عملي وشاشة رقمية سهلة التحكم. يحتوي على 999,999 ومضة، 5 مستويات طاقة، ورأس قابل للتبديل لتجربة استعمال مريحة ومنظمة، يساعد على تقليل نمو الشعر تدريجياً والحصول على بشرة أنعم مع الاستمرار.",
      price: 45000.00,
      comparePrice: null,
      images: JSON.stringify(["/images/mlay-t16.jpg"]),
      category: "beauty-devices",
      subcategory: "Hair Removal",
      brand: "MLAY",
      ingredients: null,
      howToUse: "استخدم الجهاز على البشرة النظيفة والجافة. ابدأ بأدنى مستوى طاقة وزد تدريجياً حسب راحة البشرة. استخدم الرأس المناسب حسب المنطقة.",
      stock: 50,
      featured: true,
      variants: {
        create: [
          { name: "MLAY T16", price: 45000.00, stock: 50, sku: "MLAY-T16-001" },
        ],
      },
    },
    {
      name: "MLAY T18",
      description: "جهاز ليزر منزلي متطور لإزالة الشعر، يتميز بتقنية ذكية تتكيف مع البشرة، 3 درجات قوة، وخاصية التبريد الفوري لتجربة أكثر راحة. تصميمه أنيق وخفيف وسهل الاستعمال، مناسب للعناية المنتظمة في المنزل ويساعد على تقليل نمو الشعر تدريجياً لبشرة أنعم مع الاستمرار.",
      price: 39500.00,
      comparePrice: null,
      images: JSON.stringify(["/images/mlay-t18.jpg"]),
      category: "beauty-devices",
      subcategory: "Hair Removal",
      brand: "MLAY",
      ingredients: null,
      howToUse: "استخدم الجهاز على البشرة النظيفة والجافة. التقنية الذكية تتكيف تلقائياً مع لون البشرة. ابدأ بأدنى مستوى وزد تدريجياً حسب الراحة.",
      stock: 50,
      featured: true,
      variants: {
        create: [
          { name: "MLAY T18", price: 39500.00, stock: 50, sku: "MLAY-T18-001" },
        ],
      },
    },
    {
      name: "KODO",
      description: "جهاز لإزالة الشعر والعناية بالبشرة، من أقوى الأجهزة المنزلية متعددة الاستعمال. يحتوي على 900,000 ومضة، 8 مستويات طاقة، 4 رؤوس مختلفة، وخاصية التبريد لتجربة أكثر راحة. مناسب لتقليل نمو الشعر تدريجياً والعناية بمظهر البشرة من المنزل بطريقة سهلة ومنظمة.",
      price: 55000.00,
      comparePrice: null,
      images: JSON.stringify(["/images/kodo.jpg"]),
      category: "beauty-devices",
      subcategory: "Hair Removal",
      brand: "KODO",
      ingredients: null,
      howToUse: "اختر الرأس المناسب للمنطقة المراد علاجها. استخدم على البشرة النظيفة والجافة. ابدأ بأدنى مستوى طاقة وزد تدريجياً. استخدم 2-3 مرات أسبوعياً.",
      stock: 50,
      featured: true,
      variants: {
        create: [
          { name: "KODO", price: 55000.00, stock: 50, sku: "KODO-001" },
        ],
      },
    },
    {
      name: "Philips Lumea",
      description: "جهاز IPL منزلي يحتوي على 450,000 ومضة، 5 مستويات طاقة، ويعمل بالبطارية لحرية استعمال أكبر. مناسب لمن تبحث عن جهاز عملي لبشرة أنعم ونتائج تدريجية مع الاستمرار.",
      price: 120000.00,
      comparePrice: null,
      images: JSON.stringify(["/images/philips-lumea.jpg"]),
      category: "beauty-devices",
      subcategory: "Hair Removal",
      brand: "Philips",
      ingredients: null,
      howToUse: "استخدم الجهاز على البشرة النظيفة والجافة. ابدأ بأدنى مستوى طاقة وزد تدريجياً حسب راحة البشرة. يعمل بالبطارية لحرية حركة أكبر أثناء الاستعمال.",
      stock: 30,
      featured: true,
      variants: {
        create: [
          { name: "Philips Lumea", price: 120000.00, stock: 30, sku: "PHIL-LUM-001" },
        ],
      },
    },
    {
      name: "ANLAN DermRays V4S",
      description: "يتميز بـ 10 مستويات طاقة، و3 أنواع من الأشعة، مع قوة أداء عالية جدًا وجودة تصنيع ممتازة، ليمنحك تجربة استعمال منزلية عملية ومريحة للعناية بالبشرة وتقليل نمو الشعر تدريجيًا.",
      price: 68000.00,
      comparePrice: null,
      images: JSON.stringify(["/images/anlan-v4s.jpg"]),
      category: "beauty-devices",
      subcategory: "Hair Removal",
      brand: "ANLAN",
      ingredients: null,
      howToUse: "اختر نوع الشعاع المناسب للمنطقة المراد علاجها. استخدم على البشرة النظيفة والجافة. ابدأ بأدنى مستوى طاقة وزد تدريجياً حسب الراحة.",
      stock: 40,
      featured: true,
      variants: {
        create: [
          { name: "ANLAN DermRays V4S", price: 68000.00, stock: 40, sku: "ANLAN-V4S-001" },
        ],
      },
    },
    {
      name: "DermRays V4S",
      description: "جهاز ليزر منزلي متقدم لإزالة الشعر بتقنية ديود 810 نانومتر، مصمم ليمنحك تجربة عناية العيادة داخل منزلك. يتميز بومضات تلقائية لتسهيل الاستخدام، ونظام تبريد يساعد على جعل الجلسة أكثر راحة. خيار مثالي لمن تبحث عن جهاز قوي، عملي، وعالي الجودة لتقليل نمو الشعر.",
      price: 140000.00,
      comparePrice: null,
      images: JSON.stringify(["/images/dermrays-v4s.jpg"]),
      category: "beauty-devices",
      subcategory: "Hair Removal",
      brand: "DermRays",
      ingredients: null,
      howToUse: "استخدم الجهاز على البشرة النظيفة والجافة. ابدأ بأدنى مستوى طاقة وزد تدريجياً. الومضات التلقائية تسهّل الاستخدام والنتيجة تدريجية مع الاستمرار.",
      stock: 30,
      featured: true,
      variants: {
        create: [
          { name: "DermRays V4S", price: 140000.00, stock: 30, sku: "DERM-V4S-001" },
        ],
      },
    },
    {
      name: "Tria Laser 4X",
      description: "جهاز ليزر منزلي بتقنية الديود لإزالة الشعر، مصمم ليمنحك تجربة عناية قريبة من العيادة داخل المنزل. يتميز بقوة أداء عالية، تصميم مريح وسهل الاستخدام، وتقنية احترافية تساعد على تقليل نمو الشعر تدريجياً مع الاستعمال المنتظم. خيار مناسب لمن تبحث عن جهاز قوي وموثوق للعناية بالبشرة والحصول على نعومة تدوم لفترة أطول.",
      price: 139000.00,
      comparePrice: null,
      images: JSON.stringify(["/images/tria-4x.jpg"]),
      category: "beauty-devices",
      subcategory: "Hair Removal",
      brand: "Tria",
      ingredients: null,
      howToUse: "استخدم الجهاز على البشرة النظيفة والجافة. ابدأ بأدنى مستوى طاقة وزد تدريجياً. الاستعمال المنتظم يضمن نتائج أفضل ونعومة تدوم.",
      stock: 30,
      featured: true,
      variants: {
        create: [
          { name: "Tria Laser 4X", price: 139000.00, stock: 30, sku: "TRIA-4X-001" },
        ],
      },
    },
    {
      name: "Braun Pro 5",
      description: "جهاز IPL منزلي عالي الجودة لإزالة الشعر، مصمم للاستعمال السهل والآمن في المنزل. يحتوي على 400,000 ومضة، 3 درجات طاقة، ويمنحك تجربة عملية ومريحة للعناية المنتظمة بالبشرة، مع نتائج تدريجية لبشرة أنعم مع الاستمرار.",
      price: 135000.00,
      comparePrice: null,
      images: JSON.stringify(["/images/braun-pro5.jpg"]),
      category: "beauty-devices",
      subcategory: "Hair Removal",
      brand: "Braun",
      ingredients: null,
      howToUse: "استخدم الجهاز على البشرة النظيفة والجافة. ابدأ بأدنى مستوى طاقة وزد تدريجياً حسب راحة البشرة. استخدم بانتظام للحصول على أفضل النتائج.",
      stock: 30,
      featured: true,
      variants: {
        create: [
          { name: "Braun Pro 5", price: 135000.00, stock: 30, sku: "BRAUN-P5-001" },
        ],
      },
    },
  ];

  for (const productData of products) {
    const { variants, ...data } = productData;
    await prisma.product.create({
      data: {
        ...data,
        variants: variants || undefined,
      },
    });
  }

  console.log(`Created ${products.length} products`);

  const coupons = [
    {
      code: "WELCOME20",
      discount: 20,
      type: "PERCENTAGE",
      minAmount: 30,
      maxUses: 100,
      usedCount: 5,
      expiresAt: new Date("2027-12-31"),
      isActive: true,
    },
    {
      code: "GLOW10",
      discount: 10,
      type: "PERCENTAGE",
      minAmount: null,
      maxUses: null,
      usedCount: 12,
      expiresAt: new Date("2027-06-30"),
      isActive: true,
    },
    {
      code: "FREESHIP",
      discount: 5,
      type: "FIXED",
      minAmount: 50,
      maxUses: 50,
      usedCount: 8,
      expiresAt: new Date("2027-03-31"),
      isActive: true,
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.create({ data: coupon });
  }

  console.log(`Created ${coupons.length} coupons`);

  const reviews = [
    {
      rating: 5,
      comment: "جهاز ممتاز ونتائجه واضحة بعد فترة قصيرة. أنصح به بشدة!",
      userId: user.id,
      productId: "",
    },
  ];

  const firstProduct = await prisma.product.findFirst();

  if (firstProduct) {
    reviews[0].productId = firstProduct.id;
  }

  for (const review of reviews) {
    if (review.productId) {
      await prisma.review.create({ data: review }).catch(() => {});
    }
  }

  console.log("Reviews created");
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
