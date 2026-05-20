import time
import os
import traceback
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains

options = webdriver.EdgeOptions()
options.add_argument('--headless')
options.add_argument('--window-size=1366,768')
options.add_argument('--ignore-certificate-errors')

driver = webdriver.Edge(options=options)

BASE_URL = "http://51.161.32.204:8085"
IMG_DIR = r"c:\proyectos\oj\docs\img"

def capture(name):
    try:
        path = os.path.join(IMG_DIR, name)
        driver.save_screenshot(path)
        print(f"Captured: {path}")
    except Exception as e:
        print(f"Failed to capture {name}: {e}")

try:
    print("Capturando Login...")
    driver.get(f"{BASE_URL}/login")
    time.sleep(4)
    capture("login.png")

    print("Haciendo Login...")
    inputs = driver.find_elements(By.CSS_SELECTOR, "input")
    if len(inputs) >= 2:
        inputs[0].clear()
        inputs[0].send_keys("admin")
        time.sleep(1)
        inputs[1].clear()
        inputs[1].send_keys("admin123")
        time.sleep(1)
        
        btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        driver.execute_script("arguments[0].click();", btn)
        
    time.sleep(5)
    
    print("Capturando Dashboard...")
    capture("dashboard.png")
    
    print("Capturando Expedientes...")
    driver.get(f"{BASE_URL}/expedientes")
    time.sleep(4)
    capture("listado_expedientes.png")
    
    print("Capturando Gestión de Usuarios...")
    driver.get(f"{BASE_URL}/admin/usuarios")
    time.sleep(4)
    capture("gestion_usuarios.png")
    
    print("Capturando Bóveda Documental...")
    driver.get(f"{BASE_URL}/expedientes")
    time.sleep(4)
    
    # Try to find a button to enter Boveda
    try:
        buttons = driver.find_elements(By.CSS_SELECTOR, "button.p-button-text")
        if buttons:
            driver.execute_script("arguments[0].click();", buttons[0])
            time.sleep(4)
            capture("boveda_documental.png")
            
            # Now try to open the PDF viewer inside
            inner_buttons = driver.find_elements(By.CSS_SELECTOR, "button.p-button-rounded")
            if inner_buttons:
                driver.execute_script("arguments[0].click();", inner_buttons[0])
                time.sleep(4)
                capture("visor_pdf.png")
    except Exception as inner_ex:
        print(f"Error en Boveda: {inner_ex}")

except Exception as e:
    print(f"Error general: {e}")
    traceback.print_exc()

finally:
    driver.quit()
    print("Terminado.")
