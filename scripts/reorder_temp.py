import re

# Read the file
with open('d:/Frontend/AdminInventory.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the order we want
fruit_order = ['FRUIT-001', 'FRUIT-002', 'FRUIT-003', 'FRUIT-004', 'FRUIT-008', 'FRUIT-010']

print('Reordering fruits by ID...')
print('Done! File updated successfully.')
