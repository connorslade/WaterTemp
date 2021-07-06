# Startup this whole system :P

from datetime import datetime
import subprocess
import os

# CONFIG
NODE_COMMAND = 'node'
NPM_COMMAND = 'npm'
NPX_COMMAND = 'npx'
CARGO_COMMAND = 'cargo'


def colored(text, color):
    """Add ANSI color codes to the text"""
    return f'\033[{color}m{text}\033[0m'


def debugPrint(Category, Text, Color):
    """Format a print with the current time, a category and colored text"""
    print(
        f"{colored('['+datetime.now().strftime('%H:%M:%S')+']', 33)} {colored('['+Category+']', 35)} {colored(Text, Color)}")


def runCommand(command, cb=None):
    # print(command)
    process = subprocess.Popen(command, stdout=subprocess.PIPE, shell=True)
    while True:
        line = process.stdout.readline()
        text = line.decode("utf-8").replace('\n', '')
        if not line:
            break
        if text == '':
            continue
        if cb != None:
            cb(text)
    exit_code = process.wait()
    return exit_code


def checkNode(cb=None):
    """Make sure NODE.JS is installed"""
    if cb != None:
        version = int(cb[1:].replace('.', ''))
        if version < 12000:
            debugPrint('Startup', 'NODE.JS version is too old', 31)
            exit()
        return
    return runCommand([NODE_COMMAND, '--version'], checkNode) == 0


def checkNpm(cb=None):
    """Make sure NPM is installed"""
    if cb != None:
        version = int(cb.replace('.', ''))
        if version < 6000:
            debugPrint('Startup', 'NPM version is too old', 31)
            exit()
        return
    return runCommand([NPM_COMMAND, '--version'], checkNpm) == 0


def checkNpx(cb=None):
    """Make sure NPX is installed"""
    if cb != None:
        version = int(cb.replace('.', ''))
        if version < 1500:
            debugPrint('Startup', 'CARGO version is too old', 31)
            exit()
        return
    return runCommand([NPX_COMMAND, '-v'], checkNpx) == 0


def checkCargo(cb=None):
    """Make sure CARGO is installed"""
    if cb != None:
        version = int(cb.split(' ')[1].replace('.', ''))
        if version < 1500:
            debugPrint('Startup', 'CARGO version is too old', 31)
            exit()
        return
    return runCommand([CARGO_COMMAND, '-V'], checkCargo) == 0


def compileTS():
    debugPrint('Typescript', 'Checking for NPX', 33)
    if not checkNpx():
        debugPrint('Typescript', 'Installing NPX', 33)
        runCommand([NPM_COMMAND, 'install', '-g', 'npx'])
    debugPrint('Typescript', 'Compileing Typescript', 33)
    os.chdir('./static')
    runCommand([NPX_COMMAND, 'tsc'])
    os.chdir('../')


def startSensorInterface():
    os.chdir('./sensor_Interface')
    debugPrint('SensorInterface', 'Checking for CARGO', 33)
    if not checkCargo():
        debugPrint('SensorInterface',
                   'Please Install CARGO and rerun this script', 33)
        exit()
    debugPrint('SensorInterface', 'Building Sensor Server', 33)
    if runCommand([CARGO_COMMAND, 'build', '--release']) != 0:
        debugPrint('SensorInterface', 'CARGO failed to build', 31)
        exit()
    debugPrint('SensorInterface', 'Starting Sensor Server', 33)
    subprocess.Popen(['cargo', 'run', '--', '--debug'])
    os.chdir('../')


def startWebServer():
    os.chdir('./api')
    subprocess.Popen([NODE_COMMAND, 'src', '--debug'])
    os.chdir('../')


def main():
    debugPrint('Startup', 'Checking NODE.JS', 33)
    if not checkNode():
        exit()
    debugPrint('Startup', 'Checking for NPM', 33)
    if not checkNpm():
        exit()
    debugPrint('Startup', 'Compileing Typescript', 33)
    compileTS()
    debugPrint('Startup', 'Starting Sensor Interface', 33)
    startSensorInterface()
    debugPrint('Startup', 'Starting Web Server', 33)
    startWebServer()


if __name__ == '__main__':
    debugPrint('Main', 'Starting', 32)
    try:
        main()
    except:
        debugPrint('Main', 'Uhhh... Houston, we have a problem.', 31)
