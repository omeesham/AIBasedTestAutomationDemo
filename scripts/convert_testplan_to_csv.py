#!/usr/bin/env python3
"""
Test Plan Markdown to CSV Converter

This script converts a test plan from Markdown format to CSV format,
extracting test cases, steps, and expectations for better processing
and integration with test management tools.

Usage: python convert_testplan_to_csv.py
"""

import re
import csv
import os
from typing import List, Dict, Tuple


class TestPlanConverter:
    def __init__(self, markdown_file: str, csv_file: str):
        self.markdown_file = markdown_file
        self.csv_file = csv_file
        self.test_data = []
        
    def parse_markdown(self) -> List[Dict]:
        """Parse the markdown file and extract test case information"""
        with open(self.markdown_file, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Split content into sections
        lines = content.split('\n')
        current_test_case = None
        current_step_num = 0
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            # Skip empty lines
            if not line:
                continue
                
            # Extract main test case sections (#### 1.1, 1.2, etc.)
            if re.match(r'^####\s+\d+\.\d+\..*', line):
                match = re.match(r'^####\s+(\d+\.\d+)\.\s+(.*)', line)
                if match:
                    current_test_case = {
                        'test_case_number': match.group(1),
                        'test_case_title': match.group(2).strip(),
                        'file_path': '',
                        'description': ''
                    }
                    current_step_num = 0
                    
            # Extract file path
            elif line.startswith('**File:**') and current_test_case:
                file_match = re.search(r'`([^`]+)`', line)
                if file_match:
                    current_test_case['file_path'] = file_match.group(1)
                    
            # Extract description if present
            elif line.startswith('**Description:**') and current_test_case:
                current_test_case['description'] = line.replace('**Description:**', '').strip()
                
            # Extract steps
            elif re.match(r'^\s*\d+\.', line) and current_test_case:
                current_step_num += 1
                step_match = re.match(r'^\s*\d+\.\s*(.*)', line)
                if step_match:
                    step_description = step_match.group(1).strip()
                    
                    # Look ahead for expectations
                    expectations = []
                    j = i + 1
                    while j < len(lines):
                        next_line = lines[j].strip()
                        if not next_line:
                            j += 1
                            continue
                        if next_line.startswith('- expect:'):
                            expectation = next_line.replace('- expect:', '').strip()
                            expectations.append(expectation)
                        elif re.match(r'^\s*\d+\.', next_line):  # Next step
                            break
                        elif next_line.startswith('####'):  # Next test case
                            break
                        j += 1
                    
                    # Add test data entry
                    test_entry = {
                        'test_suite': 'EspoCRM Opportunities Management',
                        'test_case_number': current_test_case['test_case_number'],
                        'test_case_title': current_test_case['test_case_title'],
                        'file_path': current_test_case['file_path'],
                        'description': current_test_case['description'],
                        'step_number': current_step_num,
                        'step_description': step_description,
                        'expectations': ' | '.join(expectations) if expectations else ''
                    }
                    self.test_data.append(test_entry)
                    
            # Extract sub-steps (bold headers like **Application Access and Authentication**)
            elif line.startswith('**') and line.endswith('**') and current_test_case and not line.startswith('**File:**') and not line.startswith('**Description:**'):
                sub_step_title = line.replace('**', '').strip()
                
                # Look ahead for sub-step details
                expectations = []
                actions = []
                j = i + 1
                while j < len(lines):
                    next_line = lines[j].strip()
                    if not next_line:
                        j += 1
                        continue
                    if next_line.startswith('- Navigate') or next_line.startswith('- Click') or next_line.startswith('- Fill') or next_line.startswith('- Use') or next_line.startswith('- Test') or next_line.startswith('- Validate') or next_line.startswith('- Verify') or next_line.startswith('- Add') or next_line.startswith('- Save') or next_line.startswith('- Return') or next_line.startswith('- Locate') or next_line.startswith('- Edit') or next_line.startswith('- Modify'):
                        action = next_line.replace('- ', '').strip()
                        actions.append(action)
                    elif next_line.startswith('- expect:'):
                        expectation = next_line.replace('- expect:', '').strip()
                        expectations.append(expectation)
                    elif next_line.startswith('**') and next_line.endswith('**'):  # Next sub-step
                        break
                    elif re.match(r'^\s*\d+\.', next_line):  # Next numbered step
                        break
                    elif next_line.startswith('####'):  # Next test case
                        break
                    j += 1
                
                if actions or expectations:
                    combined_description = f"{sub_step_title}: {' | '.join(actions)}" if actions else sub_step_title
                    current_step_num += 1
                    
                    test_entry = {
                        'test_suite': 'EspoCRM Opportunities Management',
                        'test_case_number': current_test_case['test_case_number'],
                        'test_case_title': current_test_case['test_case_title'],
                        'file_path': current_test_case['file_path'],
                        'description': current_test_case['description'],
                        'step_number': current_step_num,
                        'step_description': combined_description,
                        'expectations': ' | '.join(expectations) if expectations else ''
                    }
                    self.test_data.append(test_entry)
        
        return self.test_data
    
    def write_csv(self):
        """Write the extracted test data to CSV file"""
        if not self.test_data:
            print("No test data to write. Please parse markdown first.")
            return
        
        fieldnames = [
            'test_suite',
            'test_case_number',
            'test_case_title',
            'file_path',
            'description',
            'step_number',
            'step_description',
            'expectations'
        ]
        
        with open(self.csv_file, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(self.test_data)
        
        print(f"Successfully converted {len(self.test_data)} test steps to {self.csv_file}")
    
    def convert(self):
        """Main conversion method"""
        print(f"Converting {self.markdown_file} to {self.csv_file}...")
        
        if not os.path.exists(self.markdown_file):
            print(f"Error: Markdown file '{self.markdown_file}' not found.")
            return False
        
        # Parse the markdown file
        self.parse_markdown()
        
        if not self.test_data:
            print("No test data found in the markdown file.")
            return False
        
        # Write to CSV
        self.write_csv()
        return True
    
    def print_summary(self):
        """Print a summary of the converted data"""
        if not self.test_data:
            print("No data to summarize.")
            return
        
        test_cases = set(item['test_case_number'] for item in self.test_data)
        total_steps = len(self.test_data)
        
        print(f"\n=== Conversion Summary ===")
        print(f"Total Test Cases: {len(test_cases)}")
        print(f"Total Test Steps: {total_steps}")
        print(f"Test Cases: {', '.join(sorted(test_cases))}")
        
        # Show some sample data
        print(f"\n=== Sample Data (First 3 Rows) ===")
        for i, item in enumerate(self.test_data[:3]):
            print(f"Row {i+1}:")
            print(f"  Test Case: {item['test_case_number']} - {item['test_case_title']}")
            print(f"  Step: {item['step_number']} - {item['step_description'][:100]}...")
            print(f"  Expectations: {item['expectations'][:100]}...")
            print()


def main():
    """Main execution function"""
    # Define file paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    markdown_file = os.path.join(current_dir, 'specs', 'espocrm-opportunities-test-plan.md')
    csv_file = os.path.join(current_dir, 'output', 'espocrm_test_plan.csv')
    
    # Create output directory if it doesn't exist
    output_dir = os.path.dirname(csv_file)
    os.makedirs(output_dir, exist_ok=True)
    
    # Create converter instance and convert
    converter = TestPlanConverter(markdown_file, csv_file)
    
    if converter.convert():
        converter.print_summary()
        print(f"\nCSV file saved to: {csv_file}")
    else:
        print("Conversion failed.")


if __name__ == "__main__":
    main()