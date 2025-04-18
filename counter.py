import tkinter as tk
from tkinter import ttk, simpledialog
import json
from datetime import datetime


class CounterApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.categories = {}
        self.title("Counter App")
        self.geometry("900x600")
        # self.configure(bg="#111324")
        self.create_widgets()
        self.iconbitmap("download.ico")
        self.load_data()
        self.check_for_new_day()
        self.update_category_combobox()
        self.update_display_data()
        self.active_buttons()

        style = ttk.Style(self)
        style.configure("TButton", font=("courier", 14), padding=5)

    def create_widgets(self):
        # Top Section
        ttk.Label(self, text="New Category:").grid(row=0, column=0, padx=10,
                                                   pady=5, sticky=tk.W)
        self.new_category_entry = ttk.Entry(self)
        self.new_category_entry.grid(row=0, column=1, pady=10, padx=0,
                                     sticky=tk.W)

        self.add_category_button = ttk.Button(self, text="Add", width=10,
                                              command=self.add_category)
        self.add_category_button.grid(row=0, column=2, padx=10, pady=10,
                                      sticky=tk.W)

        self.delete_category_button = ttk.Button(self, text="Delete", width=10,
                                                 command=self.delete_category)
        self.delete_category_button.grid(row=0, column=3, padx=10, pady=5,
                                         sticky=tk.W)

        # Middle Section
        ttk.Label(self, text="Select Category:").grid(row=1, column=0, padx=10,
                                                      pady=5, sticky=tk.W)
        self.category_combobox = ttk.Combobox(self, state="readonly")
        self.category_combobox.grid(row=1, column=1, pady=5, columnspan=3,
                                    sticky=tk.W)
        self.category_combobox.bind("<<ComboboxSelected>>",
                                    self.on_category_selected)

        self.increment_button = ttk.Button(self, text="Increment",
                                           command=self.increment)
        self.increment_button.grid(row=2, column=0, padx=10, pady=5,
                                   sticky=tk.W)

        self.increment_button_by_half = ttk.Button(self, text="Increment 0.5",
                                                   command=self.add_half)
        self.increment_button_by_half.grid(row=3, column=0, padx=10, pady=5,
                                           sticky=tk.W)

        self.decrement_button = ttk.Button(self, text="Decrement",
                                           command=self.decrement,
                                           state=tk.DISABLED)
        self.decrement_button.grid(row=2, column=1, pady=5, sticky=tk.W)

        self.reset_button = ttk.Button(self, text="Reset category",
                                       command=self.reset_values)
        self.reset_button.grid(row=2, column=2, padx=10, pady=5)

        self.decrement_button_by_half = ttk.Button(self, text="Decrement 0.5",
                                                   command=self.decrement_half)
        self.decrement_button_by_half.grid(row=3, column=1, pady=5,
                                           sticky=tk.W)

        self.value_label = ttk.Label(self, text="Current Value: 0")
        self.value_label.grid(row=4, column=0, columnspan=3, pady=5, padx=10,
                              sticky=tk.W)

        # Bottom Section
        self.data_table = ttk.Treeview(self, columns=(
        "Category", "Value", "Last Updated", "added Today"), show="headings")
        self.data_table.heading("Category", text="Category")
        self.data_table.column("Category", anchor=tk.CENTER)
        self.data_table.heading("Value", text="Value")
        self.data_table.column("Value", anchor=tk.CENTER)
        self.data_table.heading("Last Updated", text="Last Updated")
        self.data_table.column("Last Updated", anchor=tk.CENTER)
        self.data_table.heading("added Today", text="added Today times")
        self.data_table.column("added Today", anchor=tk.CENTER)

        self.data_table.grid(row=5, column=0, columnspan=4, pady=10, padx=10)

    def add_category(self):
        new_category = self.new_category_entry.get()
        if new_category:
            update_time = self.updated_at()
            self.categories[new_category] = {
                "value": 0,
                "last_updated": update_time,
                "clicks_today": 0,
                "last_click_date": update_time.split()[0]
            }
            self.update_category_combobox()
            self.clear_table()
            self.save_data()
            self.value_label["text"] = "Current Value: 0"
            self.new_category_entry.delete(0, tk.END)
            self.update_display_data()
            self.active_buttons()

    def delete_category(self):
        category = self.category_combobox.get()
        if category in self.categories:
            del self.categories[category]
            self.update_category_combobox()
            self.clear_table()
            self.save_data()
            self.value_label["text"] = "Current Value: 0"
            self.update_display_data()
            self.active_buttons()

    def update_category_combobox(self):
        categories_as_list = list(self.categories.keys())
        sorted_list = sorted(categories_as_list)
        self.category_combobox["values"] = sorted_list

        if categories_as_list:
            self.category_combobox.set(sorted_list[0])
        else:
            self.category_combobox.set("")
            self.category_combobox["values"] = []

    def on_category_selected(self, event):
        selected_category = self.category_combobox.get()
        if selected_category:
            current_value = self.categories[selected_category]["value"]
            self.value_label[
                "text"] = f"Current Value for {selected_category}: {current_value}"
            self.highlight_table_row(selected_category)

    def highlight_table_row(self, category):
        for row in self.data_table.get_children():
            if self.data_table.item(row)["values"][0] == category:
                self.data_table.selection_set(row)
                self.data_table.see(row)
                break

    def increment(self):
        self.track_clicks()
        current_value = self.get_value()
        incremented_value = current_value + 1

        updated = self.updated_at()
        self.set_value(incremented_value, updated)
        self.update_display_label(incremented_value)
        self.update_display_data()

    def add_half(self):
        self.track_clicks()
        current_value = self.get_value()
        incremented_value = current_value + 0.5
        updated = self.updated_at()
        self.set_value(incremented_value, updated)
        self.update_display_label(incremented_value)
        self.update_display_data()

    def decrement(self):
        current_value = self.get_value()
        decremented_value = current_value - 1
        updated = self.updated_at()
        self.set_value(decremented_value, updated)
        self.update_display_label(decremented_value)
        self.update_display_data()

    def decrement_half(self):
        current_value = self.get_value()
        decremented_value = current_value - 0.5
        updated = self.updated_at()
        self.set_value(decremented_value, updated)
        self.update_display_label(decremented_value)
        self.update_display_data()

    def get_value(self):
        category = self.category_combobox.get()
        category_value = self.categories[category].get("value", 0)
        return category_value

    def set_value(self, value, updated):
        category = self.category_combobox.get()
        self.categories[category]["value"] = value
        self.categories[category]["last_updated"] = updated
        self.save_data()

    def update_display_label(self, value):
        category = self.category_combobox.get()
        self.value_label["text"] = f"Current Value for {category}: {value}"

    def load_data(self):
        try:
            with open("data.json", "r") as file:
                self.categories = json.load(file)
        except FileNotFoundError:
            pass  # If the file does not exist, start with an empty dictionary

    def save_data(self):
        with open("data.json", "w") as file:
            json.dump(self.categories, file, indent=2)

    def clear_table(self):
        for item in self.data_table.get_children():
            self.data_table.delete(item)

    def update_display_data(self):
        self.clear_table()
        for category, data in self.categories.items():
            value = data.get("value", 0)
            update_time = data.get("last_updated", " ")
            clicks_today = data.get("clicks_today", 0)
            self.data_table.insert("", "end", values=(
            category, value, update_time, clicks_today))

    def updated_at(self):
        last_updated = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return last_updated

    def reset_values(self):
        category = self.category_combobox.get()
        if category in self.categories:
            updated = self.updated_at()
            self.categories[category]["value"] = 0
            self.categories[category]["last_updated"] = updated
            self.categories[category]["clicks_today"] = 0
            self.categories[category]["last_click_date"] = updated.split()[0]
            self.save_data()
            self.update_display_data()
            self.update_display_label(0)

    def check_for_new_day(self):
        today_date = datetime.now().strftime("%Y-%m-%d")
        for category, data in self.categories.items():
            last_click_date = data.get("last_click_date", "")
            if last_click_date != today_date:
                self.categories[category]["clicks_today"] = 0
                self.categories[category]["last_click_date"] = today_date
        self.save_data()

    def track_clicks(self):
        category = self.category_combobox.get()
        today_date = datetime.now().strftime("%Y-%m-%d")
        if self.categories[category]["last_click_date"] == today_date:
            self.categories[category]["clicks_today"] += 1
        else:
            self.categories[category]["clicks_today"] = 1
            self.categories[category]["last_click_date"] = today_date
        self.save_data()

    def active_buttons(self):
        if len(self.categories) > 0:
            self.decrement_button.config(state=tk.NORMAL)
        else:
            self.decrement_button.config(state=tk.DISABLED)


if __name__ == "__main__":
    app = CounterApp()
    app.mainloop()
