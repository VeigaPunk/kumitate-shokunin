import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ablate93
ablate93.main("resolvedcaptured", sys.argv[1:])
