import os
import re

def update_file(path, replacements):
    if not os.path.exists(path): return
    with open(path, 'r') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(path, 'w') as f:
        f.write(content)

# Update frontend/app/app/log/page.tsx
log_replacements = [
    ("import { saveActivity } from \"@/lib/storage\";", "import { createActivity } from \"@/lib/api\";\nimport { ACTIVITY_CONFIGS } from \"@/lib/calculations\";"),
    ("const doSave = () => {", "const doSave = async () => {"),
    ("saveActivity(activityType as ActivityType, parseFloat(quantity), date);", "const config = ACTIVITY_CONFIGS[activityType];\n    await createActivity(activityType, config.category, parseFloat(quantity), config.unit, date);")
]
update_file('frontend/app/app/log/page.tsx', log_replacements)

print("Frontend files updated")
