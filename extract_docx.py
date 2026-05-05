#!/usr/bin/env python3
"""Extract and analyze ATTENDANCE SHEET.docx"""

import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

docx_path = r"D:\APPS\ATTENDANCE SHEET WEB\ATTENDANCE SHEET.docx"

# Extract and read document
with zipfile.ZipFile(docx_path, 'r') as zip_ref:
    # Read the main document XML
    xml_content = zip_ref.read('word/document.xml')
    
# Parse XML
root = ET.fromstring(xml_content)

# Define namespace
ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

# Extract all text elements
print("=" * 80)
print("ATTENDANCE SHEET DOCUMENT ANALYSIS")
print("=" * 80)
print()

# Get all paragraphs and tables
paragraphs = root.findall('.//w:p', ns)
tables = root.findall('.//w:tbl', ns)

print(f"Document Structure:")
print(f"  - Paragraphs: {len(paragraphs)}")
print(f"  - Tables: {len(tables)}")
print()

# Extract all text from paragraphs
print("-" * 80)
print("PARAGRAPH CONTENT:")
print("-" * 80)
for i, para in enumerate(paragraphs):
    text_elements = para.findall('.//w:t', ns)
    para_text = ''.join([t.text for t in text_elements if t.text])
    if para_text.strip():
        print(f"P{i}: {para_text}")

# Extract table data
print()
print("-" * 80)
print("TABLE CONTENT:")
print("-" * 80)
for table_idx, table in enumerate(tables):
    print(f"\nTable {table_idx + 1}:")
    rows = table.findall('.//w:tr', ns)
    print(f"  Rows: {len(rows)}")
    
    for row_idx, row in enumerate(rows):
        cells = row.findall('.//w:tc', ns)
        row_data = []
        for cell in cells:
            cell_text_elements = cell.findall('.//w:t', ns)
            cell_text = ''.join([t.text for t in cell_text_elements if t.text])
            row_data.append(cell_text)
        
        # Print row with better formatting
        print(f"  Row {row_idx + 1}: {' | '.join(row_data)}")

print()
print("=" * 80)
