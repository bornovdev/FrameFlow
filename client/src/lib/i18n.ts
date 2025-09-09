interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Navigation
    'nav.frames': 'Frames',
    'nav.sunglasses': 'Sunglasses',
    'nav.reading': 'Reading',
    'nav.collections': 'Collections',
    'nav.orders': 'My Orders',
    'nav.settings': 'Settings',
    
    // Common actions
    'action.add_to_cart': 'Add to Cart',
    'action.buy_now': 'Buy Now',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.search': 'Search',
    
    // Product related
    'product.out_of_stock': 'Out of Stock',
    'product.only_left': 'Only {count} left in stock!',
    'product.frame_color': 'Frame Color',
    'product.lens_type': 'Lens Type',
    
    // Cart and checkout
    'cart.empty': 'Your Cart is Empty',
    'cart.continue_shopping': 'Continue Shopping',
    'checkout.shipping_info': 'Shipping Information',
    'checkout.order_summary': 'Order Summary',
    'checkout.subtotal': 'Subtotal',
    'checkout.tax': 'Tax',
    'checkout.shipping': 'Shipping',
    'checkout.total': 'Total',
    'checkout.free_shipping': 'Free',
    
    // Orders
    'orders.title': 'My Orders',
    'orders.no_orders': 'No Orders Yet',
    'orders.track_manage': 'Track and manage your eyewear orders',
    'orders.items_ordered': 'Items Ordered',
    
    // Settings
    'settings.title': 'System Settings',
    'settings.general': 'General Settings',
    'settings.notifications': 'Notification Settings',
    'settings.store_name': 'Store Name',
    'settings.store_email': 'Store Email',
    'settings.currency': 'Currency',
    'settings.timezone': 'Timezone',
    'settings.language': 'Language',
    'settings.email_notifications': 'Email Notifications',
    'settings.email_notifications_desc': 'Receive email notifications for new orders',
    'settings.low_stock_alerts': 'Low Stock Alerts',
    'settings.low_stock_alerts_desc': 'Get notified when products are low in stock',
    'settings.save_settings': 'Save Settings',
    'settings.saving': 'Saving...',
    'settings.saved': 'Settings saved successfully!',
    
    // Admin
    'admin.total_revenue': 'Total Revenue',
    'admin.total_orders': 'Total Orders',
    'admin.active_products': 'Active Products',
    'admin.total_customers': 'Total Customers',
    'admin.top_products': 'Top Selling Products',
    
    // Auth
    'auth.welcome_back': 'Welcome Back',
    'auth.create_account': 'Create Account',
    'auth.sign_in': 'Sign In',
    'auth.signing_in': 'Signing In...',
    'auth.create_account_desc': 'Join {storeName} and discover premium eyewear',
    'auth.welcome_premium': 'Welcome to premium eyewear',
  },
  
  ar: {
    // Navigation
    'nav.frames': 'إطارات',
    'nav.sunglasses': 'نظارات شمسية',
    'nav.reading': 'نظارات قراءة',
    'nav.collections': 'المجموعات',
    'nav.orders': 'طلباتي',
    'nav.settings': 'الإعدادات',
    
    // Common actions
    'action.add_to_cart': 'أضف للسلة',
    'action.buy_now': 'اشتري الآن',
    'action.save': 'حفظ',
    'action.cancel': 'إلغاء',
    'action.edit': 'تعديل',
    'action.delete': 'حذف',
    'action.search': 'بحث',
    
    // Product related
    'product.out_of_stock': 'نفذت الكمية',
    'product.only_left': 'متبقي {count} فقط!',
    'product.frame_color': 'لون الإطار',
    'product.lens_type': 'نوع العدسة',
    
    // Cart and checkout
    'cart.empty': 'سلتك فارغة',
    'cart.continue_shopping': 'متابعة التسوق',
    'checkout.shipping_info': 'معلومات الشحن',
    'checkout.order_summary': 'ملخص الطلب',
    'checkout.subtotal': 'المجموع الفرعي',
    'checkout.tax': 'الضريبة',
    'checkout.shipping': 'الشحن',
    'checkout.total': 'المجموع',
    'checkout.free_shipping': 'مجاني',
    
    // Orders
    'orders.title': 'طلباتي',
    'orders.no_orders': 'لا توجد طلبات بعد',
    'orders.track_manage': 'تتبع وإدارة طلبات النظارات الخاصة بك',
    'orders.items_ordered': 'المنتجات المطلوبة',
    
    // Settings
    'settings.title': 'إعدادات النظام',
    'settings.general': 'الإعدادات العامة',
    'settings.notifications': 'إعدادات الإشعارات',
    'settings.store_name': 'اسم المتجر',
    'settings.store_email': 'بريد المتجر',
    'settings.currency': 'العملة',
    'settings.timezone': 'المنطقة الزمنية',
    'settings.language': 'اللغة',
    'settings.email_notifications': 'إشعارات البريد الإلكتروني',
    'settings.email_notifications_desc': 'استقبل إشعارات البريد الإلكتروني للطلبات الجديدة',
    'settings.low_stock_alerts': 'تنبيهات المخزون المنخفض',
    'settings.low_stock_alerts_desc': 'احصل على إشعار عند انخفاض مخزون المنتجات',
    'settings.save_settings': 'حفظ الإعدادات',
    'settings.saving': 'جاري الحفظ...',
    'settings.saved': 'تم حفظ الإعدادات بنجاح!',
    
    // Admin
    'admin.total_revenue': 'إجمالي الإيرادات',
    'admin.total_orders': 'إجمالي الطلبات',
    'admin.active_products': 'المنتجات النشطة',
    'admin.total_customers': 'إجمالي العملاء',
    'admin.top_products': 'أكثر المنتجات مبيعاً',
    
    // Auth
    'auth.welcome_back': 'مرحباً بعودتك',
    'auth.create_account': 'إنشاء حساب',
    'auth.sign_in': 'تسجيل الدخول',
    'auth.signing_in': 'جاري تسجيل الدخول...',
    'auth.create_account_desc': 'انضم إلى {storeName} واكتشف النظارات الفاخرة',
    'auth.welcome_premium': 'مرحباً بك في عالم النظارات الفاخرة',
  },
  
  hi: {
    // Navigation
    'nav.frames': 'फ्रेम्स',
    'nav.sunglasses': 'धूप के चश्मे',
    'nav.reading': 'रीडिंग ग्लासेज',
    'nav.collections': 'संग्रह',
    'nav.orders': 'मेरे ऑर्डर',
    'nav.settings': 'सेटिंग्स',
    
    // Common actions
    'action.add_to_cart': 'कार्ट में जोड़ें',
    'action.buy_now': 'अभी खरीदें',
    'action.save': 'सहेजें',
    'action.cancel': 'रद्द करें',
    'action.edit': 'संपादित करें',
    'action.delete': 'हटाएं',
    'action.search': 'खोज',
    
    // Product related
    'product.out_of_stock': 'स्टॉक में नहीं',
    'product.only_left': 'केवल {count} बचे हैं!',
    'product.frame_color': 'फ्रेम का रंग',
    'product.lens_type': 'लेंस का प्रकार',
    
    // Cart and checkout
    'cart.empty': 'आपका कार्ट खाली है',
    'cart.continue_shopping': 'खरीदारी जारी रखें',
    'checkout.shipping_info': 'शिपिंग जानकारी',
    'checkout.order_summary': 'ऑर्डर सारांश',
    'checkout.subtotal': 'उप-योग',
    'checkout.tax': 'कर',
    'checkout.shipping': 'शिपिंग',
    'checkout.total': 'कुल',
    'checkout.free_shipping': 'मुफ्त',
    
    // Orders
    'orders.title': 'मेरे ऑर्डर',
    'orders.no_orders': 'अभी तक कोई ऑर्डर नहीं',
    'orders.track_manage': 'अपने चश्मे के ऑर्डर को ट्रैक और प्रबंधित करें',
    'orders.items_ordered': 'ऑर्डर की गई वस्तुएं',
    
    // Settings
    'settings.title': 'सिस्टम सेटिंग्स',
    'settings.general': 'सामान्य सेटिंग्स',
    'settings.notifications': 'नोटिफिकेशन सेटिंग्स',
    'settings.store_name': 'स्टोर का नाम',
    'settings.store_email': 'स्टोर ईमेल',
    'settings.currency': 'मुद्रा',
    'settings.timezone': 'समय क्षेत्र',
    'settings.language': 'भाषा',
    'settings.email_notifications': 'ईमेल नोटिफिकेशन',
    'settings.email_notifications_desc': 'नए ऑर्डर के लिए ईमेल नोटिफिकेशन प्राप्त करें',
    'settings.low_stock_alerts': 'कम स्टॉक अलर्ट',
    'settings.low_stock_alerts_desc': 'जब उत्पाद कम स्टॉक में हों तो सूचना प्राप्त करें',
    'settings.save_settings': 'सेटिंग्स सहेजें',
    'settings.saving': 'सहेजा जा रहा है...',
    'settings.saved': 'सेटिंग्स सफलतापूर्वक सहेजी गईं!',
    
    // Admin
    'admin.total_revenue': 'कुल राजस्व',
    'admin.total_orders': 'कुल ऑर्डर',
    'admin.active_products': 'सक्रिय उत्पाद',
    'admin.total_customers': 'कुल ग्राहक',
    'admin.top_products': 'सबसे ज्यादा बिकने वाले उत्पाद',
    
    // Auth
    'auth.welcome_back': 'वापस स्वागत है',
    'auth.create_account': 'खाता बनाएं',
    'auth.sign_in': 'साइन इन करें',
    'auth.signing_in': 'साइन इन हो रहा है...',
    'auth.create_account_desc': '{storeName} में शामिल हों और प्रीमियम चश्मे खोजें',
    'auth.welcome_premium': 'प्रीमियम चश्मों में आपका स्वागत है',
  }
};

export function useTranslation(language: string = 'en') {
  const t = (key: string, params?: { [key: string]: string | number }): string => {
    let translation = translations[language]?.[key] || translations['en'][key] || key;
    
    // Replace parameters in translation
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(new RegExp(`{${param}}`, 'g'), String(params[param]));
      });
    }
    
    return translation;
  };

  return { t };
}

export const getAvailableLanguages = () => [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
];