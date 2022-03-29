
import secrets
number_of_rows = 200
number_of_columns = 25
for row_number in range(number_of_rows):
    randoms = [secrets.randbelow(16)+1 for i in range(number_of_columns)]
    row = []
    for i in range(number_of_columns):
        if i != 0:
            if row_number % 2 != 0 and i % 2 != 0:
                row.append(0)
                continue
            elif row_number % 2 == 0 and i % 2 == 0:
                row.append(0)
                continue
        row.append(randoms[i])
    print(','.join(map(str, row)) + ',')
