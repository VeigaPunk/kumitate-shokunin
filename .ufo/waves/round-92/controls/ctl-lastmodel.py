import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ablate92
ablate92.main("lastmodel", sys.argv[1:])
