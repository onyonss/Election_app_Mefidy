import serial
import time

def test_serial(port='COM6', baudrate=115200):
    try:
        ser = serial.Serial(port, baudrate, timeout=1)
        print(f"Connected to {port} at {baudrate} baud")
        ser.flushInput()  # Clear input buffer
        ser.flushOutput()  # Clear output buffer
        time.sleep(2)  # Wait for ESP8266 to initialize

        # Read initial sensor output
        print("Reading initial output from ESP8266...")
        start_time = time.time()
        while time.time() - start_time < 5:  # Wait up to 5 seconds for initial output
            if ser.in_waiting:
                try:
                    line = ser.readline()
                    if line:
                        try:
                            decoded_line = line.decode('utf-8').strip()
                            print(decoded_line)
                        except UnicodeDecodeError:
                            print(f"Decode error, Raw bytes: {line}")
                except serial.SerialException as e:
                    print(f"Serial read error: {e}")
                    break
            time.sleep(0.1)

        # Send ENROLL command
        user_id = 1
        command = f"ENROLL:{user_id}\n"
        print(f"Sending command: {command.strip()}")
        ser.write(command.encode('utf-8'))
        ser.flush()

        # Read response with timeout
        print("Waiting for enrollment response...")
        start_time = time.time()
        while time.time() - start_time < 30:  # 30-second timeout for enrollment
            if ser.in_waiting:
                try:
                    line = ser.readline()
                    if line:
                        try:
                            decoded_line = line.decode('utf-8').strip()
                            print(decoded_line)
                            if decoded_line.startswith("ENROLL_SUCCESS:"):
                                parts = decoded_line.split(":")
                                if len(parts) == 3:
                                    id, status = parts[1], parts[2]
                                    print(f"Enrollment successful for ID {id}")
                                    return id, status
                            elif decoded_line == "ENROLL_FAILED":
                                print("Enrollment failed")
                                return None, "FAILED"
                        except UnicodeDecodeError:
                            print(f"Decode error, Raw bytes: {line}")
                except serial.SerialException as e:
                    print(f"Serial read error: {e}")
                    return None, "SERIAL_ERROR"
            time.sleep(0.1)
        print("Timeout: No response from sensor")
        return None, "TIMEOUT"
    except serial.SerialException as e:
        print(f"Serial connection error: {e}")
        return None, "SERIAL_ERROR"
    finally:
        if 'ser' in locals() and ser.is_open:
            ser.close()
            print("Serial connection closed")

if __name__ == "__main__":
    id, status = test_serial()
    print(f"Result: ID={id}, Status={status}")