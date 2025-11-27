from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
import time
import os
import base64

# ==========================
CHROMEDRIVER_PATH = r"C:\chromedriver\chromedriver.exe"
SAVE_FOLDER = r"C:\lexi_data"
BASE_URL = "https://online.lexi.com/lco/action/index/generic/multinat_f/{}"
LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

# ==========================
options = webdriver.ChromeOptions()
options.add_argument("--start-maximized")
options.add_argument("--save-page-as-mhtml")  # مهم لحفظ MHTML
service = Service(CHROMEDRIVER_PATH)
driver = webdriver.Chrome(service=service, options=options)

# صفحة تسجيل الدخول
driver.get("https://online.lexi.com/lco/action/home")
print("سجّل دخولك يدويًا، وبعدها اضغط ENTER")
input()

# إنشاء فولدر حفظ لو مش موجود
os.makedirs(SAVE_FOLDER, exist_ok=True)

# ==========================
# حلقة الحروف
# ==========================
for letter in LETTERS:
    print(f"\n===== الحرف {letter} =====")
    url = BASE_URL.format(letter)
    driver.get(url)
    time.sleep(4)

    # جمع روابط الأدوية
    drug_links = driver.find_elements(By.CSS_SELECTOR, "a[href*='/lco/action/doc/']")
    urls = [a.get_attribute("href") for a in drug_links]
    print(f"عدد الأدوية: {len(urls)}")

    for drug_url in urls:
        driver.get(drug_url)
        time.sleep(3)

        title = driver.title.split("|")[0].strip()
        safe_name = "".join(c for c in title if c.isalnum() or c in " -_")
        filename = os.path.join(SAVE_FOLDER, f"{safe_name}.mhtml")

        # ==========================
        # توسيع كل الأقسام الموجودة
        # ==========================
        try:
            expand_buttons = driver.find_elements(By.XPATH, "//a[text()='Expand' or text()='Expand All']")
            if expand_buttons:
                for btn in expand_buttons:
                    driver.execute_script("arguments[0].click();", btn)
                    time.sleep(0.5)  # وقت بسيط لكل expand
                print(f"✔ تم توسيع {len(expand_buttons)} قسم/أقسام")
            else:
                print("لا توجد أقسام للتوسيع")
        except Exception as e:
            print("حدث خطأ أثناء التوسيع:", e)

        # حفظ الصفحة كاملة كمستند MHTML
        mhtml = driver.execute_cdp_cmd('Page.captureSnapshot', {'format': 'mhtml'})
        with open(filename, "wb") as f:
            f.write(mhtml['data'].encode('utf-8'))

        print(f"✔ تم حفظ MHTML: {safe_name}")
        time.sleep(2)

driver.quit()
print("اكتمل تحميل جميع الحروف كـ Webpage Complete!")

