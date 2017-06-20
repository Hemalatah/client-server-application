import sys
import requests
import json
from tabulate import tabulate

command_list = ["--h", "--sitestotest", "--getresult", "--getstatus", "--getall"]
arg_count = len(sys.argv)

if arg_count < 2:
 print "type --h for help list"
 sys.exit(1)
cmd = sys.argv[1]
args = []

if arg_count > 2:
    args = sys.argv[2:]

def print_help(args): 
    print "--sitestotest: list the sites that needs to be tested"
    print "--getresult[testHandle]: returns the test results for given testhandle"
    print "--getstatus[testHandle]: returns the test status for a given testhandle"

def sitestoTest(sitelist):
    data = {"sitestotest" : sitelist[:-1], "iteration" : sitelist[-1]}
    data = json.dumps(data)
    try:
        r1 = requests.post("https://www.localhost:8000/startTest", data = data)
        print "Test Started";
        print "Test Handle: ", sitelist
    except requests.exceptions.RequestException as e:
        print "Error: ", e
        sys.exit(1)

def gettestResults(testHandle):
    url = "https://www.localhost:8000//testResults?testHandle=" + testHandle[0];
    try:
        r2 = requests.get(url)
        print "Test Handle: ", testHandle[0]
        results = r2.json()
        print tabulate([results["ID"], results["testHandle"], results["statusCode"], results["status"], results["avg"], results["max"], results["min"], results["startTestTime"], results["endTestTime"], results["Request took"]], headers = ["ID", "testHandle", "statusCode", "status", "avg", "max", "min", "startTestTime", "endTestTime", "Request took"])
    except requests.exceptions.RequestException as e:
        print "Error: ", e
        sys.exit(1)

def gettestStatus(testHandle):
    url = "https://www.localhost:8000//testStatus?testHandle=" + testHandle[0];
    try: 
        r3 = requests.get(url)
        print "Test Handle: ", testHandle[0]
        status = r3.json()
        print "Status: ", status
    except requests.exceptions.RequestException as e:
        print "Error: ", e
        sys.exit(1)
    

def getAll(testHandle):
    url = "https://www.localhost:8000//allTests";
    try:
        r4 = requests.get(url)
        print "All Test Handles: "
        allTests = r4.json()
        print allTests
    except requests.exceptions.RequestException as e:
        print "Error: ", e
        sys.exit(1)

cmd_handlers = {}

cmd_handlers["--h"] = print_help
cmd_handlers["--sitestotest"] = sitestoTest
cmd_handlers["--getresult"] = gettestResults
cmd_handlers["--getstatus"] = gettestStatus
cmd_handlers["--getall"] = getAll

def cmd_handler(cmd, args):
    cmd_handlers[cmd](args)


if cmd not in command_list:
    print "Invalid comd %s" % cmd
    print_help(cmd)
    sys.exit(1)

if __name__ == '__main__':
    cmd_handler(cmd, args)
