/* ═══════════════════════════════════════════════════════════
   AXIOM · curated study packs (offline fallback for Study Anything)
   Comprehensive, level-scaled content: beginner / medium / master
   ═══════════════════════════════════════════════════════════ */
const PACKS = {
  "python": {
    title: "Python",
    overview: "A general-purpose language whose readability makes it the default for scripting, data work and automation. The roadmap below moves from syntax to idioms to the runtime model, scaling from beginner to master.",
    levels: {
      beginner: { roadmap: [
        { id:"py-b1", title:"Variables and types", why:"Every program begins by naming values. Without this you cannot store, reuse or transform anything.", how:"Python binds a name to an object. The object carries its type; the name is just a label. No declaration keyword is needed.", explain:[
          { line:"x = 42", detail:"The name x now refers to an int object. Assignment creates the binding." },
          { line:"x = 'hello'", detail:"The same name can later refer to a str. Python is dynamically typed — the variable has no fixed type." },
          { line:"type(x)", detail:"Returns the runtime type of the object x points to. Useful for debugging." },
          { line:"a, b = 1, 2", detail:"Tuple unpacking: multiple names bound in one statement. Works for any iterable." },
          { line:"x, y = y, x", detail:"Swap two variables without a temp variable, using tuple packing/unpacking." },
          { line:"None", detail:"Python's null. Represents absence of a value. Falsy in conditionals." }
        ], references:[{title:"Python tutorial — informal introduction",url:"https://docs.python.org/3/tutorial/introduction.html"},{title:"Real Python — variables",url:"https://realpython.com/python-variables/"},{title:"Python data model",url:"https://docs.python.org/3/reference/datamodel.html"}] },
        { id:"py-b2", title:"Control flow", why:"Programs must choose and repeat. if/for/while are the three primitives of logic.", how:"Indentation defines blocks. There are no braces. Colons introduce suites.", explain:[
          { line:"if x > 0:", detail:"Condition followed by a colon; the indented block runs only when true." },
          { line:"elif x == 0:", detail:"Chained condition; checked only if the previous was false." },
          { line:"else:", detail:"Fallback block when all conditions are false." },
          { line:"for i in range(5):", detail:"Iterates over an iterable; range yields 0..4 lazily (no list built)." },
          { line:"while not done:", detail:"Repeats until the condition becomes false. Risk of infinite loops." },
          { line:"break / continue / pass", detail:"Exit loop early, skip to next iteration, or do nothing (placeholder)." }
        ], references:[{title:"Python control flow",url:"https://docs.python.org/3/tutorial/controlflow.html"},{title:"Real Python — loops",url:"https://realpython.com/python-for-loop/"},{title:"Real Python — conditionals",url:"https://realpython.com/python-conditional-statements/"}] },
        { id:"py-b3", title:"Functions", why:"Reuse and abstraction. A function hides detail behind a name and a contract.", how:"def creates a function object. Arguments are passed by object reference. Return sends a value back.", explain:[
          { line:"def add(a, b):", detail:"Defines add; a, b are parameters. The body is indented." },
          { line:"return a + b", detail:"Sends a value back to the caller. Without return, None is returned." },
          { line:"add(2, 3)", detail:"Call with positional arguments." },
          { line:"def f(x, y=0):", detail:"Default argument: y defaults to 0 if omitted. Defaults evaluated once at def time." },
          { line:"def g(*args, **kwargs):", detail:"Variadic: *args collects positional, **kwargs collects keyword arguments." },
          { line:"lambda x: x+1", detail:"Anonymous single-expression function. Useful for callbacks and sorting keys." }
        ], references:[{title:"Python functions",url:"https://docs.python.org/3/tutorial/controlflow.html#defining-functions"},{title:"Real Python — functions",url:"https://realpython.com/defining-your-own-python-function/"},{title:"Real Python — lambda",url:"https://realpython.com/python-lambda/"}] },
        { id:"py-b4", title:"Lists and dictionaries", why:"Collections are the workhorse of real programs. Choosing the right one shapes performance.", how:"Lists are ordered and mutable; dicts map keys to values with O(1) average lookup. Both are built-in and highly optimised.", explain:[
          { line:"lst = [1, 2, 3]", detail:"A list literal. Indexing starts at 0. Negative indices count from the end." },
          { line:"lst.append(4)", detail:"Mutates the list in place. Amortised O(1)." },
          { line:"lst[1:3]", detail:"Slicing: returns a new list with elements at indices 1 and 2." },
          { line:"d = {'a': 1}", detail:"A dict literal. Keys must be hashable (immutable)." },
          { line:"d['b'] = 2", detail:"Insert or update a key. O(1) average." },
          { line:"d.get('c', 0)", detail:"Safe lookup with a default if the key is missing." }
        ], references:[{title:"Python data structures",url:"https://docs.python.org/3/tutorial/datastructures.html"},{title:"Real Python — lists",url:"https://realpython.com/python-lists-tuples/"},{title:"Real Python — dicts",url:"https://realpython.com/python-dicts/"}] },
        { id:"py-b5", title:"Strings and files", why:"Text processing and persistence are in every real script.", how:"Strings are immutable sequences of characters. Files are opened with open() and should be closed (use with).", explain:[
          { line:"'hello' + ' world'", detail:"Concatenation. For many pieces, use ''.join()." },
          { line:"f'x = {x}'", detail:"f-string: embeds expressions. Fast and readable." },
          { line:"s.split(',')", detail:"Splits into a list. Opposite of join." },
          { line:"with open('f.txt') as fh:", detail:"Context manager: file is closed automatically, even on exceptions." },
          { line:"fh.read() / fh.readlines()", detail:"Read whole file or list of lines." },
          { line:"fh.write('text')", detail:"Write a string. Returns number of chars written." }
        ], references:[{title:"Python strings",url:"https://docs.python.org/3/tutorial/introduction.html#strings"},{title:"Real Python — file I/O",url:"https://realpython.com/read-write-files-python/"},{title:"Real Python — f-strings",url:"https://realpython.com/python-f-strings/"}] },
        { id:"py-b6", title:"Error handling", why:"Real programs fail. Handling errors gracefully separates toys from tools.", how:"try/except catches exceptions. finally runs always. raise creates an exception.", explain:[
          { line:"try: risky()", detail:"Wrap code that might fail." },
          { line:"except ValueError as e:", detail:"Catch a specific exception type and bind the instance." },
          { line:"except Exception:", detail:"Catch broadly (avoid bare except)." },
          { line:"finally:", detail:"Runs whether or not an exception occurred. Use for cleanup." },
          { line:"raise ValueError('msg')", detail:"Create and throw an exception." },
          { line:"else:", detail:"Runs only if no exception was raised in try." }
        ], references:[{title:"Errors and exceptions",url:"https://docs.python.org/3/tutorial/errors.html"},{title:"Real Python — exceptions",url:"https://realpython.com/python-exceptions/"}] }
      ]},
      medium: { roadmap: [
        { id:"py-m1", title:"Comprehensions and generators", why:"Concise, fast, memory-efficient transformations of data. The Pythonic way.", how:"A comprehension builds a collection in one expression; a generator yields values lazily, one at a time.", explain:[
          { line:"[x*x for x in range(10)]", detail:"List comprehension: builds the full list in memory." },
          { line:"{x: x*x for x in range(10)}", detail:"Dict comprehension." },
          { line:"(x*x for x in range(10))", detail:"Generator expression: computes values on demand, O(1) memory." },
          { line:"def gen(): yield x", detail:"Generator function: state is suspended between yields." },
          { line:"next(g)", detail:"Pulls the next value from a generator." },
          { line:"yield from other", detail:"Delegates to another iterable." }
        ], references:[{title:"List comprehensions",url:"https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions"},{title:"Real Python — generators",url:"https://realpython.com/introduction-to-python-generators/"},{title:"Real Python — comprehensions",url:"https://realpython.com/list-comprehension-python/"}] },
        { id:"py-m2", title:"Classes and objects", why:"Model real-world entities and bundle data with behaviour. The OOP foundation.", how:"class defines a blueprint; __init__ initialises instances; self refers to the instance.", explain:[
          { line:"class Dog:", detail:"Defines a new type." },
          { line:"def __init__(self, name):", detail:"Constructor; self is the instance being created." },
          { line:"self.name = name", detail:"Instance attribute." },
          { line:"def bark(self):", detail:"Instance method; self is passed automatically." },
          { line:"@classmethod / @staticmethod", detail:"Methods that receive the class or nothing." },
          { line:"d = Dog('Rex'); d.bark()", detail:"Instantiate and call a method." }
        ], references:[{title:"Classes",url:"https://docs.python.org/3/tutorial/classes.html"},{title:"Real Python — OOP",url:"https://realpython.com/python3-object-oriented-programming/"},{title:"Real Python — classmethods",url:"https://realpython.com/instance-class-and-static-methods-demystified/"}] },
        { id:"py-m3", title:"Decorators and context managers", why:"Add behaviour without changing the wrapped code. Cross-cutting concerns.", how:"A decorator is a function that takes a function and returns a function. with statements use __enter__/__exit__.", explain:[
          { line:"@retry", detail:"Applies retry to the function below it." },
          { line:"def retry(fn): ...", detail:"The decorator receives fn and returns a wrapper." },
          { line:"functools.wraps", detail:"Preserves the original function's metadata." },
          { line:"with open('f') as fh:", detail:"Guarantees the file is closed even on exceptions." },
          { line:"__enter__ / __exit__", detail:"The two methods that make an object usable with with." },
          { line:"contextlib.contextmanager", detail:"Turn a generator into a context manager." }
        ], references:[{title:"Decorators",url:"https://docs.python.org/3/glossary.html#term-decorator"},{title:"Real Python — decorators",url:"https://realpython.com/primer-on-python-decorators/"},{title:"Real Python — context managers",url:"https://realpython.com/python-with-statement/"}] },
        { id:"py-m4", title:"Modules and packages", why:"Split code into reusable, importable units. The path to maintainable projects.", how:"A module is a .py file; a package is a directory with __init__.py. import brings names into scope.", explain:[
          { line:"import math", detail:"Loads the math module; use math.sqrt." },
          { line:"from math import sqrt", detail:"Imports only sqrt into the current namespace." },
          { line:"from . import sibling", detail:"Relative import within a package." },
          { line:"if __name__ == '__main__':", detail:"Runs code only when the file is executed, not imported." },
          { line:"pip install requests", detail:"Installs a third-party package into the environment." },
          { line:"pyproject.toml", detail:"Modern project metadata and build configuration." }
        ], references:[{title:"Modules",url:"https://docs.python.org/3/tutorial/modules.html"},{title:"Real Python — imports",url:"https://realpython.com/python-import/"},{title:"Packaging guide",url:"https://packaging.python.org/en/latest/"}] },
        { id:"py-m5", title:"Testing with pytest", why:"Catch regressions automatically. Tests are the safety net for refactoring.", how:"pytest discovers test_*.py files and test_* functions. Assertions use plain assert.", explain:[
          { line:"def test_add():", detail:"pytest collects functions starting with test_." },
          { line:"assert add(2,3) == 5", detail:"Plain assert; pytest shows a diff on failure." },
          { line:"@pytest.fixture", detail:"Reusable setup/teardown for tests." },
          { line:"pytest.raises(ValueError)", detail:"Assert that an exception is raised." },
          { line:"parametrize", detail:"Run the same test with many inputs." },
          { line:"conftest.py", detail:"Shared fixtures across a directory." }
        ], references:[{title:"pytest docs",url:"https://docs.pytest.org/en/stable/"},{title:"Real Python — pytest",url:"https://realpython.com/pytest-python-testing/"},{title:"pytest fixtures",url:"https://docs.pytest.org/en/stable/how-to/fixtures.html"}] },
        { id:"py-m6", title:"Type hints and dataclasses", why:"Make code self-documenting and catch bugs with static analysis.", how:"Annotations describe expected types. dataclass generates __init__, __repr__, __eq__ from annotated fields.", explain:[
          { line:"def f(x: int) -> str:", detail:"Annotate parameters and return type." },
          { line:"from typing import List, Optional", detail:"Generic types (Python 3.9+ allows list[int])." },
          { line:"@dataclass", detail:"Decorator that generates boilerplate." },
          { line:"@dataclass(frozen=True)", detail:"Immutable instances." },
          { line:"mypy / pyright", detail:"Static type checkers that use annotations." },
          { line:"Protocol", detail:"Structural typing: 'duck typing' checked statically." }
        ], references:[{title:"Type hints (PEP 484)",url:"https://peps.python.org/pep-0484/"},{title:"dataclasses",url:"https://docs.python.org/3/library/dataclasses.html"},{title:"Real Python — type checking",url:"https://realpython.com/python-type-checking/"}] }
      ]},
      master: { roadmap: [
        { id:"py-x1", title:"The GIL and concurrency", why:"Understand what Python can and cannot parallelise. The #1 interview topic.", how:"The Global Interpreter Lock allows only one thread to execute Python bytecode at a time. Use processes or async I/O for true parallelism.", explain:[
          { line:"threading.Thread", detail:"Good for I/O-bound work; limited by the GIL for CPU-bound work." },
          { line:"multiprocessing.Process", detail:"Separate processes, each with its own interpreter and GIL." },
          { line:"asyncio", detail:"Single-threaded cooperative multitasking for I/O. Event loop." },
          { line:"concurrent.futures", detail:"High-level pool of threads or processes." },
          { line:"async/await", detail:"Coroutines: async def defines one; await suspends." },
          { line:"asyncio.gather", detail:"Run multiple coroutines concurrently." }
        ], references:[{title:"GIL explained",url:"https://wiki.python.org/moin/GlobalInterpreterLock"},{title:"Real Python — concurrency",url:"https://realpython.com/python-concurrency/"},{title:"Real Python — asyncio",url:"https://realpython.com/async-io-python/"}] },
        { id:"py-x2", title:"Metaclasses and descriptors", why:"Control how classes are created and how attribute access works. Framework-level Python.", how:"type is the default metaclass; metaclass= replaces it. Descriptors implement __get__/__set__/__delete__.", explain:[
          { line:"class Meta(type):", detail:"A metaclass inherits from type." },
          { line:"class A(metaclass=Meta):", detail:"Meta creates A." },
          { line:"def __new__(cls, ...):", detail:"Runs before __init__; returns the new class." },
          { line:"def __init_subclass__(cls):", detail:"Hook called when a class is subclassed." },
          { line:"class Desc:", detail:"Implement __get__ to intercept attribute reads." },
          { line:"__set_name__", detail:"Called when the descriptor is assigned in a class body." }
        ], references:[{title:"Metaclasses",url:"https://docs.python.org/3/reference/datamodel.html#metaclasses"},{title:"Descriptor guide",url:"https://docs.python.org/3/howto/descriptor.html"},{title:"Real Python — metaclasses",url:"https://realpython.com/python-metaclasses/"}] },
        { id:"py-x3", title:"Memory model and GC", why:"Avoid leaks and understand object lifetimes. Essential for long-running services.", how:"Reference counting plus a cyclic garbage collector. __del__ is unreliable; use context managers.", explain:[
          { line:"sys.getrefcount(obj)", detail:"Returns the reference count (one extra for the argument itself)." },
          { line:"gc.collect()", detail:"Forces a collection of cyclic garbage." },
          { line:"weakref.ref(obj)", detail:"A reference that does not keep the object alive." },
          { line:"__slots__", detail:"Removes the per-instance __dict__, saving memory." },
          { line:"tracemalloc", detail:"Track memory allocations by source line." },
          { line:"objgraph", detail:"Visualise reference graphs to find leaks." }
        ], references:[{title:"Memory management",url:"https://docs.python.org/3/c-api/memory.html"},{title:"gc module",url:"https://docs.python.org/3/library/gc.html"},{title:"Real Python — memory",url:"https://realpython.com/python-memory-management/"}] },
        { id:"py-x4", title:"C extensions and performance", why:"When Python is too slow, drop to C. Also understand why it's slow.", how:"ctypes/cffi call C libraries; Cython compiles Python-like code to C; PyPy is a JIT alternative.", explain:[
          { line:"ctypes.CDLL('lib.so')", detail:"Load a shared library." },
          { line:"cffi", detail:"Cleaner FFI with C declarations in Python strings." },
          { line:"Cython", detail:"Compile annotated Python to C for speed." },
          { line:"PyPy", detail:"Alternative interpreter with a JIT; faster for pure Python." },
          { line:"numpy / numba", detail:"Vectorise or JIT-compile numerical code." },
          { line:"profiling (cProfile, py-spy)", detail:"Measure before optimising." }
        ], references:[{title:"Extending Python",url:"https://docs.python.org/3/extending/index.html"},{title:"Cython docs",url:"https://cython.readthedocs.io/"},{title:"py-spy",url:"https://github.com/benfred/py-spy"}] }
      ]}
    }
  },

  "data-structures": {
    title: "Data Structures",
    overview: "The building blocks behind every algorithm. Pick the right structure and the algorithm becomes trivial; pick the wrong one and no algorithm saves you. Content scales from basic containers to advanced structures.",
    levels: {
      beginner: { roadmap: [
        { id:"ds-b1", title:"Arrays and lists", why:"The default container. O(1) access by index, O(n) insert in the middle.", how:"Contiguous memory; index maps to an offset. Dynamic arrays grow by reallocation.", explain:[
          { line:"arr[i]", detail:"Direct address: base + i * sizeof(element)." },
          { line:"arr.append(x)", detail:"Amortised O(1): occasionally the whole array is copied to a larger buffer." },
          { line:"arr.insert(0, x)", detail:"O(n): every element shifts right." },
          { line:"slicing arr[a:b]", detail:"Copies a new list of length b-a." },
          { line:"list comprehension", detail:"[f(x) for x in arr] builds a new list." },
          { line:"len(arr)", detail:"Number of elements, O(1) for Python lists." }
        ], references:[{title:"Array data structure",url:"https://en.wikipedia.org/wiki/Array_data_structure"},{title:"Python lists",url:"https://docs.python.org/3/tutorial/datastructures.html"},{title:"Visualgo — array",url:"https://visualgo.net/en/array"}] },
        { id:"ds-b2", title:"Stacks and queues", why:"Model undo, parsing, scheduling and BFS. Two of the most reused abstractions.", how:"Stack is LIFO (push/pop at one end); queue is FIFO (enqueue at back, dequeue at front).", explain:[
          { line:"stack.append(x); stack.pop()", detail:"Both O(1) at the end of a list." },
          { line:"collections.deque", detail:"Double-ended queue; O(1) at both ends." },
          { line:"queue: enqueue rear, dequeue front", detail:"Use deque, not a list, to avoid O(n) pops." },
          { line:"Use cases — stack", detail:"DFS, expression evaluation, undo, call stack." },
          { line:"Use cases — queue", detail:"BFS, task scheduling, buffering." },
          { line:"priority queue", detail:"Dequeues the highest-priority item, not the oldest." }
        ], references:[{title:"Stack",url:"https://en.wikipedia.org/wiki/Stack_(abstract_data_type)"},{title:"Queue",url:"https://en.wikipedia.org/wiki/Queue_(abstract_data_type)"},{title:"deque docs",url:"https://docs.python.org/3/library/collections.html#collections.deque"}] },
        { id:"ds-b3", title:"Hash tables", why:"O(1) average lookup, insert and delete — the reason dictionaries are fast.", how:"A hash function maps a key to a bucket index. Collisions are resolved by chaining or open addressing.", explain:[
          { line:"h = hash(key) % M", detail:"Maps the key to a bucket." },
          { line:"collision", detail:"Two keys share a bucket; store them as a list or probe forward." },
          { line:"load factor", detail:"n/M; resize when it exceeds ~0.7 to keep operations O(1)." },
          { line:"worst case O(n)", detail:"If all keys collide, a hash table degrades to a list." },
          { line:"Python dict", detail:"Compact, ordered (insertion order since 3.7), open addressing." },
          { line:"hashable keys", detail:"Keys must be immutable: ints, str, tuples of hashables." }
        ], references:[{title:"Hash table",url:"https://en.wikipedia.org/wiki/Hash_table"},{title:"Python dict internals",url:"https://docs.python.org/3/library/stdtypes.html#mapping-types-dict"},{title:"Visualgo — hash",url:"https://visualgo.net/en/hashtable"}] },
        { id:"ds-b4", title:"Sets", why:"Membership testing and deduplication in O(1).", how:"A set is a hash table of keys without values. Supports union, intersection, difference.", explain:[
          { line:"s = {1, 2, 3}", detail:"Set literal. Duplicates removed." },
          { line:"x in s", detail:"O(1) average membership test." },
          { line:"s.add(x) / s.remove(x)", detail:"Insert and delete." },
          { line:"a | b, a & b, a - b", detail:"Union, intersection, difference." },
          { line:"frozenset", detail:"Immutable, hashable set." },
          { line:"subset / superset", detail:"a <= b, a >= b." }
        ], references:[{title:"Python sets",url:"https://docs.python.org/3/tutorial/datastructures.html#sets"},{title:"Set operations",url:"https://docs.python.org/3/library/stdtypes.html#set-types-set-frozenset"}] },
        { id:"ds-b5", title:"Strings", why:"Text is data. Efficient string handling matters for search and parsing.", how:"Strings are immutable sequences of characters. Operations create new strings.", explain:[
          { line:"s[i], s[a:b]", detail:"Indexing and slicing, O(k) for a slice of length k." },
          { line:"s.split(sep)", detail:"Split into a list." },
          { line:"sep.join(list)", detail:"Join a list into a string. Faster than repeated +." },
          { line:"s.find(sub)", detail:"Returns index or -1." },
          { line:"s.replace(old, new)", detail:"Returns a new string." },
          { line:"str.format / f-string", detail:"Interpolation." }
        ], references:[{title:"Python strings",url:"https://docs.python.org/3/library/stdtypes.html#text-sequence-type-str"},{title:"String methods",url:"https://docs.python.org/3/library/stdtypes.html#string-methods"}] }
      ]},
      medium: { roadmap: [
        { id:"ds-m1", title:"Linked lists", why:"O(1) insert/delete when you already hold a node; no reallocation.", how:"Each node stores data and a pointer to the next node. Singly or doubly linked.", explain:[
          { line:"node.next", detail:"Pointer to the next node; None at the end." },
          { line:"insert after node", detail:"Rewire pointers: new.next = node.next; node.next = new." },
          { line:"delete node", detail:"node.next = node.next.next (need the previous node for singly linked)." },
          { line:"trade-off", detail:"No random access; cache-unfriendly compared to arrays." },
          { line:"doubly linked", detail:"prev and next pointers; O(1) delete given the node." },
          { line:"use cases", detail:"LRU cache, adjacency in graphs, undo/redo." }
        ], references:[{title:"Linked list",url:"https://en.wikipedia.org/wiki/Linked_list"},{title:"Visualgo — linked list",url:"https://visualgo.net/en/list"},{title:"LeetCode — linked list",url:"https://leetcode.com/tag/linked-list/"}] },
        { id:"ds-m2", title:"Trees and BSTs", why:"Hierarchical data and O(log n) search when balanced.", how:"Each node has children. A BST keeps left < node < right, so search halves the space each step.", explain:[
          { line:"left < node < right", detail:"The BST invariant." },
          { line:"search: go left or right", detail:"O(h) where h is the height." },
          { line:"balanced (AVL/red-black)", detail:"Keeps h = O(log n) by rebalancing on insert/delete." },
          { line:"traversals", detail:"In-order gives sorted order; pre/post-order for copy/eval." },
          { line:"insert / delete", detail:"May require rebalancing to maintain height." },
          { line:"self-balancing", detail:"AVL (strict) vs red-black (looser, faster writes)." }
        ], references:[{title:"Binary search tree",url:"https://en.wikipedia.org/wiki/Binary_search_tree"},{title:"Visualgo — BST",url:"https://visualgo.net/en/bst"},{title:"Red-black tree",url:"https://en.wikipedia.org/wiki/Red%E2%80%93black_tree"}] },
        { id:"ds-m3", title:"Heaps and priority queues", why:"Get the min/max in O(1) and insert in O(log n).", how:"A complete binary tree stored in an array; parent at i, children at 2i+1, 2i+2. Heap property: parent <= children (min-heap).", explain:[
          { line:"heapq.heappush(h, x)", detail:"Insert and sift up. O(log n)." },
          { line:"heapq.heappop(h)", detail:"Remove min and sift down. O(log n)." },
          { line:"heapify(arr)", detail:"Build a heap in O(n)." },
          { line:"use cases", detail:"Dijkstra, top-k, streaming medians, scheduling." },
          { line:"max-heap", detail:"Negate values or use a custom comparator." },
          { line:"heap vs sorted list", detail:"Heap is faster for incremental inserts." }
        ], references:[{title:"Heap",url:"https://en.wikipedia.org/wiki/Heap_(data_structure)"},{title:"heapq module",url:"https://docs.python.org/3/library/heapq.html"},{title:"Visualgo — heap",url:"https://visualgo.net/en/heap"}] },
        { id:"ds-m4", title:"Tries", why:"Prefix search, autocomplete, spell check. O(L) lookup independent of dictionary size.", how:"A tree where each edge is a character. Shared prefixes share nodes.", explain:[
          { line:"root → c → a → t", detail:"The word 'cat' is a path from the root." },
          { line:"search O(L)", detail:"L = length of the query." },
          { line:"insert O(L)", detail:"Walk/create nodes for each character." },
          { line:"space cost", detail:"Can be large; compress with radix trees." },
          { line:"suffix trie", detail:"For substring search." },
          { line:"autocomplete", detail:"Collect all words below a prefix node." }
        ], references:[{title:"Trie",url:"https://en.wikipedia.org/wiki/Trie"},{title:"Visualgo — trie",url:"https://visualgo.net/en/trie"},{title:"LeetCode — trie",url:"https://leetcode.com/tag/trie/"}] },
        { id:"ds-m5", title:"Graphs (adjacency)", why:"Model networks, dependencies, routes. Most hard problems are graphs in disguise.", how:"Vertices and edges. Represent as adjacency list (sparse) or matrix (dense).", explain:[
          { line:"adj[u].append(v)", detail:"Adjacency list: O(V+E) space." },
          { line:"matrix[u][v] = 1", detail:"Adjacency matrix: O(V^2) space, O(1) edge test." },
          { line:"directed vs undirected", detail:"Whether edges have a direction." },
          { line:"weighted", detail:"Edges carry costs; needed for shortest paths." },
          { line:"BFS / DFS", detail:"The two fundamental traversals." },
          { line:"topological sort", detail:"Ordering of DAG nodes by dependencies." }
        ], references:[{title:"Graph",url:"https://en.wikipedia.org/wiki/Graph_(abstract_data_type)"},{title:"CP-algorithms — graphs",url:"https://cp-algorithms.com/graph/"},{title:"Visualgo — graph",url:"https://visualgo.net/en/graphds"}] }
      ]},
      master: { roadmap: [
        { id:"ds-x1", title:"Balanced trees (AVL, red-black)", why:"Guarantee O(log n) for search, insert, delete. Used in standard libraries.", how:"Rebalance on every insert/delete to keep height bounded. AVL: balance factor in {-1,0,1}. Red-black: colouring rules.", explain:[
          { line:"balance factor", detail:"height(left) - height(right). Must be in {-1,0,1}." },
          { line:"rotations", detail:"Left, right, left-right, right-left. O(1) per rotation." },
          { line:"red-black rules", detail:"Root black; red nodes have black children; all paths have equal black height." },
          { line:"use in stdlib", detail:"C++ std::map, Java TreeMap, Linux CFS scheduler." },
          { line:"B-tree", detail:"Multi-way tree for disk-based storage." },
          { line:"splay tree", detail:"Self-adjusting; recently accessed nodes move to root." }
        ], references:[{title:"AVL tree",url:"https://en.wikipedia.org/wiki/AVL_tree"},{title:"Red-black tree",url:"https://en.wikipedia.org/wiki/Red%E2%80%93black_tree"},{title:"B-tree",url:"https://en.wikipedia.org/wiki/B-tree"}] },
        { id:"ds-x2", title:"Disjoint set union (DSU)", why:"Track connected components under union operations; near O(1) with path compression.", how:"Each set has a representative. Union merges two sets; find returns the representative.", explain:[
          { line:"parent[x] = x", detail:"Initially each element is its own set." },
          { line:"find(x): parent[x]==x ? x : parent[x]=find(parent[x])", detail:"Path compression flattens the tree." },
          { line:"union by rank", detail:"Attach the shorter tree under the taller." },
          { line:"complexity", detail:"Inverse Ackermann, effectively constant." },
          { line:"use cases", detail:"Kruskal's MST, dynamic connectivity, offline LCA." },
          { line:"rollback DSU", detail:"For divide-and-conquer on trees." }
        ], references:[{title:"Disjoint-set",url:"https://en.wikipedia.org/wiki/Disjoint-set_data_structure"},{title:"CP-algorithms — DSU",url:"https://cp-algorithms.com/data_structures/disjoint_set_union.html"}] },
        { id:"ds-x3", title:"Segment tree and Fenwick tree", why:"Range queries and point updates in O(log n).", how:"Segment tree: binary tree over array segments. Fenwick (BIT): clever index arithmetic for prefix sums.", explain:[
          { line:"build O(n)", detail:"Construct the tree bottom-up." },
          { line:"query(l, r) O(log n)", detail:"Combine O(log n) nodes." },
          { line:"update(i, delta) O(log n)", detail:"Update leaf and ancestors." },
          { line:"lazy propagation", detail:"Defer range updates; push down when needed." },
          { line:"Fenwick: i += i & -i", detail:"Update index." },
          { line:"Fenwick: i -= i & -i", detail:"Query prefix." }
        ], references:[{title:"Segment tree",url:"https://cp-algorithms.com/data_structures/segment_tree.html"},{title:"Fenwick tree",url:"https://cp-algorithms.com/data_structures/fenwick.html"}] },
        { id:"ds-x4", title:"Suffix structures", why:"Substring search in O(n) preprocessing, O(m) query. Essential for bioinformatics and search.", how:"Suffix array: sorted suffixes. Suffix tree/automaton: compressed trie of suffixes.", explain:[
          { line:"suffix array", detail:"Array of starting indices of sorted suffixes." },
          { line:"LCP array", detail:"Longest common prefix between adjacent suffixes." },
          { line:"suffix automaton", detail:"Minimal DFA recognising all suffixes; O(n) size." },
          { line:"use cases", detail:"Pattern matching, longest repeated substring, LCP." },
          { line:"construction O(n)", detail:"SA-IS algorithm." },
          { line:"suffix tree", detail:"Compressed trie; O(n) with Ukkonen." }
        ], references:[{title:"Suffix array",url:"https://en.wikipedia.org/wiki/Suffix_array"},{title:"Suffix automaton",url:"https://cp-algorithms.com/string/suffix-automaton.html"}] }
      ]}
    }
  },

  "machine-learning": {
    title: "Machine Learning",
    overview: "Learn patterns from data instead of writing rules. The roadmap goes from the simplest model to the habits that keep models honest, scaling from beginner intuition to production ML.",
    levels: {
      beginner: { roadmap: [
        { id:"ml-b1", title:"What ML is", why:"Distinguish programming (rules) from learning (data). The conceptual foundation.", how:"A model is a function with parameters; training adjusts parameters to reduce a loss on data.", explain:[
          { line:"model(x; θ)", detail:"θ are the parameters learned from data." },
          { line:"loss(y, ŷ)", detail:"Measures how wrong the prediction is." },
          { line:"train / val / test", detail:"Fit on train, tune on val, report on test." },
          { line:"overfitting", detail:"Memorising train instead of learning the pattern." },
          { line:"underfitting", detail:"Model too simple to capture the pattern." },
          { line:"features", detail:"The inputs the model uses to predict." }
        ], references:[{title:"ML crash course (Google)",url:"https://developers.google.com/machine-learning/crash-course"},{title:"StatQuest — ML basics",url:"https://www.youtube.com/@statquest"},{title:"Kaggle — Intro to ML",url:"https://www.kaggle.com/learn/intro-to-machine-learning"}] },
        { id:"ml-b2", title:"Linear regression", why:"The simplest model; the foundation of most others. Start here.", how:"Fit a line y = w x + b by minimising squared error. Closed form or gradient descent.", explain:[
          { line:"ŷ = w x + b", detail:"One weight and one bias." },
          { line:"MSE = mean((y-ŷ)^2)", detail:"The loss being minimised." },
          { line:"gradient descent", detail:"Move w, b in the direction that reduces loss." },
          { line:"learning rate", detail:"Step size; too large diverges, too small is slow." },
          { line:"R²", detail:"Fraction of variance explained. 1.0 is perfect." },
          { line:"residuals", detail:"Errors y - ŷ; should be random, not patterned." }
        ], references:[{title:"Linear regression",url:"https://en.wikipedia.org/wiki/Linear_regression"},{title:"Scikit-learn — linear models",url:"https://scikit-learn.org/stable/modules/linear_model.html"},{title:"StatQuest — linear regression",url:"https://www.youtube.com/watch?v=nk2CQITm_eo"}] },
        { id:"ml-b3", title:"Train/test split and metrics", why:"A model that only scores well on its training data is useless.", how:"Hold out a test set. Use accuracy for classification, RMSE/MAE for regression, F1 for imbalanced classes.", explain:[
          { line:"train_test_split", detail:"Randomly partitions data; set random_state for reproducibility." },
          { line:"accuracy", detail:"Correct / total. Misleading on imbalanced data." },
          { line:"confusion matrix", detail:"TP, FP, TN, FN — the full picture." },
          { line:"cross-validation", detail:"Rotate the hold-out set to use all data for both." },
          { line:"RMSE / MAE", detail:"Regression metrics; RMSE penalises large errors." },
          { line:"baseline", detail:"A trivial model to beat (mean, majority class)." }
        ], references:[{title:"Model evaluation",url:"https://scikit-learn.org/stable/modules/model_evaluation.html"},{title:"Cross-validation",url:"https://scikit-learn.org/stable/modules/cross_validation.html"},{title:"Kaggle — model validation",url:"https://www.kaggle.com/learn/model-validation"}] },
        { id:"ml-b4", title:"k-nearest neighbours", why:"The simplest classifier: predict from the closest examples.", how:"For a new point, find the k closest training points and take the majority (classification) or mean (regression).", explain:[
          { line:"distance metric", detail:"Euclidean, Manhattan, cosine." },
          { line:"k", detail:"Number of neighbours. Small k = noisy; large k = smooth." },
          { line:"feature scaling", detail:"Required: distance is scale-sensitive." },
          { line:"curse of dimensionality", detail:"In high dimensions, all points are far apart." },
          { line:"lazy learning", detail:"No training; all work at prediction time." },
          { line:"weighted kNN", detail:"Closer neighbours count more." }
        ], references:[{title:"k-NN",url:"https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm"},{title:"Scikit-learn — kNN",url:"https://scikit-learn.org/stable/modules/neighbors.html"},{title:"StatQuest — kNN",url:"https://www.youtube.com/watch?v=HVXime0nQeI"}] }
      ]},
      medium: { roadmap: [
        { id:"ml-m1", title:"Logistic regression and classification", why:"The bridge from regression to classification. Still linear, but for categories.", how:"Apply a sigmoid to a linear score to get a probability; threshold at 0.5.", explain:[
          { line:"p = σ(w·x + b)", detail:"Sigmoid squashes to (0,1)." },
          { line:"cross-entropy loss", detail:"Penalises confident wrong predictions heavily." },
          { line:"decision boundary", detail:"The hyperplane where p = 0.5." },
          { line:"regularisation (L1/L2)", detail:"Penalises large weights to reduce overfitting." },
          { line:"multiclass", detail:"One-vs-rest or softmax (multinomial)." },
          { line:"calibration", detail:"Predicted probabilities should match observed frequencies." }
        ], references:[{title:"Logistic regression",url:"https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression"},{title:"StatQuest — logistic",url:"https://www.youtube.com/watch?v=yIYKR4sgzI8"},{title:"Scikit-learn — calibration",url:"https://scikit-learn.org/stable/modules/calibration.html"}] },
        { id:"ml-m2", title:"Decision trees and random forests", why:"Non-linear, interpretable models that handle mixed data types.", how:"Split on the feature that best separates classes (information gain / Gini). A forest averages many trees to reduce variance.", explain:[
          { line:"split on best feature", detail:"Greedy: pick the split that maximises purity." },
          { line:"pruning", detail:"Stop early or trim to avoid overfitting." },
          { line:"random forest", detail:"Bagging + random feature subsets decorrelates trees." },
          { line:"feature importance", detail:"How much each feature reduces impurity." },
          { line:"out-of-bag error", detail:"Free validation from bootstrap sampling." },
          { line:"extrapolation", detail:"Trees cannot extrapolate beyond training range." }
        ], references:[{title:"Decision trees",url:"https://scikit-learn.org/stable/modules/tree.html"},{title:"Random forests",url:"https://scikit-learn.org/stable/modules/ensemble.html#forests"},{title:"StatQuest — random forest",url:"https://www.youtube.com/watch?v=J4Wdy0Wc_xQ"}] },
        { id:"ml-m3", title:"Feature engineering", why:"Models are only as good as the features. Often beats a fancier model.", how:"Transform, combine, encode and scale inputs so the model can learn easily.", explain:[
          { line:"scaling (standard/minmax)", detail:"Puts features on comparable ranges." },
          { line:"one-hot encoding", detail:"Turns categories into binary columns." },
          { line:"polynomial features", detail:"Adds interactions like x1*x2." },
          { line:"leakage", detail:"Using future or target-derived info — the silent killer." },
          { line:"missing values", detail:"Impute (mean/median/mode) or add an indicator." },
          { line:"target encoding", detail:"Replace category with mean target; risk of leakage." }
        ], references:[{title:"Feature engineering",url:"https://www.kaggle.com/learn/feature-engineering"},{title:"Scikit-learn preprocessing",url:"https://scikit-learn.org/stable/modules/preprocessing.html"},{title:"Kaggle — data cleaning",url:"https://www.kaggle.com/learn/data-cleaning"}] },
        { id:"ml-m4", title:"Unsupervised learning (clustering)", why:"Find structure without labels. Useful for exploration and segmentation.", how:"k-means partitions into k clusters by minimising within-cluster variance. Hierarchical clustering builds a dendrogram.", explain:[
          { line:"k-means", detail:"Iterate: assign to nearest centroid, recompute centroid." },
          { line:"choosing k", detail:"Elbow method, silhouette score." },
          { line:"hierarchical clustering", detail:"Merge or split; produces a dendrogram." },
          { line:"DBSCAN", detail:"Density-based; finds arbitrary shapes and outliers." },
          { line:"PCA", detail:"Dimensionality reduction via variance." },
          { line:"scaling", detail:"Required for distance-based methods." }
        ], references:[{title:"Clustering",url:"https://scikit-learn.org/stable/modules/clustering.html"},{title:"StatQuest — k-means",url:"https://www.youtube.com/watch?v=4b5d3muPQmA"},{title:"PCA",url:"https://scikit-learn.org/stable/modules/decomposition.html#pca"}] }
      ]},
      master: { roadmap: [
        { id:"ml-x1", title:"Gradient boosting (XGBoost/LightGBM)", why:"The strongest off-the-shelf model for tabular data. Wins most Kaggle competitions.", how:"Trees are added sequentially, each correcting the residual errors of the previous ones.", explain:[
          { line:"F_{m} = F_{m-1} + η h_m", detail:"Shrinkage (η) and a new tree h_m." },
          { line:"second-order gradients", detail:"XGBoost uses curvature for better splits." },
          { line:"early stopping", detail:"Stop when validation loss stops improving." },
          { line:"SHAP values", detail:"Explain individual predictions." },
          { line:"monotonic constraints", detail:"Force a feature's effect to be monotonic." },
          { line:"categorical handling", detail:"LightGBM handles categoricals natively." }
        ], references:[{title:"XGBoost docs",url:"https://xgboost.readthedocs.io/"},{title:"LightGBM",url:"https://lightgbm.readthedocs.io/"},{title:"SHAP",url:"https://shap.readthedocs.io/"}] },
        { id:"ml-x2", title:"Neural networks and backprop", why:"The engine behind modern AI. Non-linear, differentiable, scalable.", how:"Layers of linear transforms + non-linearities. Backprop computes gradients via the chain rule.", explain:[
          { line:"z = Wx + b", detail:"Linear layer." },
          { line:"a = σ(z)", detail:"Non-linearity (ReLU, sigmoid, ...)." },
          { line:"loss.backward()", detail:"Chain rule from output to inputs." },
          { line:"optimizer step", detail:"SGD/Adam updates weights." },
          { line:"batch normalisation", detail:"Stabilises training." },
          { line:"dropout", detail:"Regularisation by randomly zeroing activations." }
        ], references:[{title:"Neural networks (3Blue1Brown)",url:"https://www.3blue1brown.com/topics/neural-networks"},{title:"PyTorch tutorials",url:"https://pytorch.org/tutorials/"},{title:"Deep Learning Book",url:"https://www.deeplearningbook.org/"}] },
        { id:"ml-x3", title:"MLOps: serving and monitoring", why:"A model in a notebook helps no one. Production needs reliability and observability.", how:"Package, version, serve behind an API, log predictions, monitor drift.", explain:[
          { line:"model registry", detail:"Version models like code." },
          { line:"batch vs online serving", detail:"Throughput vs latency trade-off." },
          { line:"data drift", detail:"Input distribution changes over time." },
          { line:"retraining pipeline", detail:"Automate refresh when drift is detected." },
          { line:"A/B testing", detail:"Compare models in production." },
          { line:"feature store", detail:"Centralise feature computation." }
        ], references:[{title:"MLOps (Google)",url:"https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning"},{title:"MLflow",url:"https://mlflow.org/docs/latest/index.html"},{title:"Kubeflow",url:"https://www.kubeflow.org/docs/"}] },
        { id:"ml-x4", title:"Transformers and LLMs", why:"The architecture behind ChatGPT, BERT and modern NLP.", how:"Self-attention lets each token look at every other token. Stacked with feed-forward layers.", explain:[
          { line:"attention(Q,K,V)", detail:"Weighted sum of values, weights from Q·K." },
          { line:"multi-head", detail:"Multiple attention heads capture different relations." },
          { line:"positional encoding", detail:"Inject order information." },
          { line:"pre-training + fine-tuning", detail:"Learn language, then adapt to a task." },
          { line:"RLHF", detail:"Align with human preferences." },
          { line:"prompting / RAG", detail:"Use LLMs without retraining." }
        ], references:[{title:"Attention is All You Need",url:"https://arxiv.org/abs/1706.03762"},{title:"Hugging Face course",url:"https://huggingface.co/learn/nlp-course/"},{title:"The Illustrated Transformer",url:"https://jalammar.github.io/illustrated-transformer/"}] }
      ]}
    }
  },

  "web-development": {
    title: "Web Development",
    overview: "How browsers, servers and databases cooperate to deliver an app. Start with the request/response cycle and grow outward to production systems.",
    levels: {
      beginner: { roadmap: [
        { id:"web-b1", title:"HTML and the DOM", why:"The structure of every page. Everything else builds on this.", how:"HTML tags describe content; the browser builds a tree (DOM) from them.", explain:[
          { line:"<h1>, <p>, <a>", detail:"Semantic elements for headings, paragraphs, links." },
          { line:"<div>, <span>", detail:"Generic containers; prefer semantic tags when possible." },
          { line:"attributes (href, src, alt)", detail:"Extra info on an element." },
          { line:"DOM", detail:"The in-memory tree the browser renders and JS manipulates." },
          { line:"<form>, <input>", detail:"Collect user input." },
          { line:"accessibility", detail:"alt text, labels, semantic tags help screen readers." }
        ], references:[{title:"MDN — HTML",url:"https://developer.mozilla.org/en-US/docs/Web/HTML"},{title:"MDN — DOM intro",url:"https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction"},{title:"web.dev — HTML",url:"https://web.dev/learn/html/"}] },
        { id:"web-b2", title:"CSS layout", why:"Make the structure look right. Layout is the hardest part of CSS.", how:"Box model, flexbox for 1D layouts, grid for 2D. Cascade and specificity resolve conflicts.", explain:[
          { line:"box model", detail:"content + padding + border + margin." },
          { line:"display: flex", detail:"Flex container lays out children along a main axis." },
          { line:"display: grid", detail:"Two-dimensional rows and columns." },
          { line:"specificity", detail:"id > class > element; later rules win on ties." },
          { line:"media queries", detail:"@media (max-width: 768px) { ... } for responsive design." },
          { line:"position: absolute/fixed", detail:"Remove from flow; position relative to nearest positioned ancestor." }
        ], references:[{title:"MDN — CSS",url:"https://developer.mozilla.org/en-US/docs/Web/CSS"},{title:"Flexbox guide",url:"https://css-tricks.com/snippets/css/a-guide-to-flexbox/"},{title:"Grid guide",url:"https://css-tricks.com/snippets/css/complete-guide-grid/"}] },
        { id:"web-b3", title:"JavaScript in the browser", why:"Add behaviour and interactivity. The only language browsers run natively.", how:"JS runs in the browser, manipulates the DOM, and talks to servers via fetch.", explain:[
          { line:"document.querySelector", detail:"Finds the first matching element." },
          { line:"element.addEventListener", detail:"Runs a callback on an event." },
          { line:"fetch(url)", detail:"Makes an HTTP request and returns a promise." },
          { line:"async/await", detail:"Readable syntax for promises." },
          { line:"localStorage", detail:"Persistent key-value storage in the browser." },
          { line:"console.log", detail:"Debug output in the dev tools." }
        ], references:[{title:"MDN — JavaScript",url:"https://developer.mozilla.org/en-US/docs/Web/JavaScript"},{title:"MDN — fetch",url:"https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API"},{title:"javascript.info",url:"https://javascript.info/"}] },
        { id:"web-b4", title:"Dev tools and debugging", why:"You cannot build without inspecting. Dev tools are the microscope.", how:"Elements, Console, Network, Application, Performance tabs. Breakpoints and step-through debugging.", explain:[
          { line:"Elements panel", detail:"Inspect and edit HTML/CSS live." },
          { line:"Console", detail:"Run JS, see logs and errors." },
          { line:"Network tab", detail:"See requests, responses, timings." },
          { line:"Sources → breakpoints", detail:"Pause execution and step through code." },
          { line:"Application tab", detail:"Inspect cookies, storage, service workers." },
          { line:"Lighthouse", detail:"Audit performance, accessibility, SEO." }
        ], references:[{title:"Chrome DevTools",url:"https://developer.chrome.com/docs/devtools/"},{title:"Firefox DevTools",url:"https://firefox-source-docs.mozilla.org/devtools/"}] }
      ]},
      medium: { roadmap: [
        { id:"web-m1", title:"HTTP and REST", why:"Every web app is built on request/response. Understanding it is non-negotiable.", how:"A client sends a request (method, URL, headers, body); the server responds with status, headers, body.", explain:[
          { line:"GET /users/1", detail:"Read a resource." },
          { line:"POST /users", detail:"Create a resource." },
          { line:"PUT/PATCH/DELETE", detail:"Update or remove." },
          { line:"status codes", detail:"2xx success, 3xx redirect, 4xx client error, 5xx server error." },
          { line:"headers", detail:"Content-Type, Authorization, Cache-Control." },
          { line:"CORS", detail:"Cross-origin restrictions and how to handle them." }
        ], references:[{title:"HTTP (MDN)",url:"https://developer.mozilla.org/en-US/docs/Web/HTTP"},{title:"REST",url:"https://restfulapi.net/"},{title:"CORS (MDN)",url:"https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS"}] },
        { id:"web-m2", title:"A small backend (Node/Express)", why:"Store data and enforce rules on the server. The other half of the app.", how:"Express routes map URLs to handler functions; middleware runs before handlers.", explain:[
          { line:"app.get('/api/x', handler)", detail:"Registers a GET route." },
          { line:"req, res", detail:"Request and response objects." },
          { line:"middleware", detail:"Function with (req, res, next); calls next() to continue." },
          { line:"JSON responses", detail:"res.json({...}) sets content-type and serialises." },
          { line:"error handling middleware", detail:"4-arg function (err, req, res, next)." },
          { line:"environment variables", detail:"process.env.PORT etc.; use dotenv." }
        ], references:[{title:"Express guide",url:"https://expressjs.com/en/guide/routing.html"},{title:"Node.js docs",url:"https://nodejs.org/en/docs/"},{title:"MDN — server-side",url:"https://developer.mozilla.org/en-US/docs/Learn/Server-side"}] },
        { id:"web-m3", title:"Databases (SQL)", why:"Persistent, queryable storage. The backbone of most apps.", how:"Tables of rows; SQL selects, filters, joins and aggregates. Indexes speed up lookups.", explain:[
          { line:"SELECT * FROM users WHERE id=1", detail:"Read rows matching a condition." },
          { line:"INSERT/UPDATE/DELETE", detail:"Write operations." },
          { line:"JOIN", detail:"Combine rows from two tables on a key." },
          { line:"index", detail:"A sorted structure that makes WHERE fast." },
          { line:"normalisation", detail:"Split data to avoid redundancy." },
          { line:"transactions", detail:"ACID guarantees for multi-step writes." }
        ], references:[{title:"SQL (W3Schools)",url:"https://www.w3schools.com/sql/"},{title:"PostgreSQL tutorial",url:"https://www.postgresql.org/docs/current/tutorial.html"},{title:"SQLBolt",url:"https://sqlbolt.com/"}] },
        { id:"web-m4", title:"Authentication", why:"Know who the user is. Required for any personalised app.", how:"Passwords hashed with bcrypt; sessions via signed cookies or JWTs; OAuth delegates to a provider.", explain:[
          { line:"bcrypt.hash(password)", detail:"Slow hash that resists brute force." },
          { line:"session cookie", detail:"Server stores state; client holds an opaque id." },
          { line:"JWT", detail:"Self-contained signed token; verify without DB lookup." },
          { line:"OAuth 2.0", detail:"Delegate login to Google/GitHub/etc." },
          { line:"CSRF protection", detail:"Tokens to prevent cross-site request forgery." },
          { line:"rate limiting", detail:"Prevent brute-force login attempts." }
        ], references:[{title:"OWASP auth cheatsheet",url:"https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html"},{title:"JWT intro",url:"https://jwt.io/introduction"},{title:"Passport.js",url:"https://www.passportjs.org/"}] }
      ]},
      master: { roadmap: [
        { id:"web-x1", title:"Caching and performance", why:"Fast apps win. Caching avoids recomputation and round trips.", how:"Browser cache (HTTP headers), CDN, server cache (Redis), database query cache.", explain:[
          { line:"Cache-Control", detail:"Tells the browser/CDN how long to keep a response." },
          { line:"ETag / 304", detail:"Conditional requests avoid re-sending unchanged data." },
          { line:"Redis", detail:"In-memory store for hot data." },
          { line:"lazy loading", detail:"Load code/data only when needed." },
          { line:"code splitting", detail:"Split bundles; load on demand." },
          { line:"Web Vitals", detail:"LCP, FID, CLS — measure real user experience." }
        ], references:[{title:"Web performance (MDN)",url:"https://developer.mozilla.org/en-US/docs/Web/Performance"},{title:"HTTP caching",url:"https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching"},{title:"web.dev — performance",url:"https://web.dev/performance/"}] },
        { id:"web-x2", title:"Security", why:"Protect users and data. Security is not a feature; it's a requirement.", how:"OWASP top 10: XSS, SQLi, CSRF, etc. Defend with input validation, parameterised queries, CSP.", explain:[
          { line:"XSS", detail:"Inject scripts into pages; escape output." },
          { line:"SQL injection", detail:"Parameterised queries prevent it." },
          { line:"CSP", detail:"Content Security Policy restricts script sources." },
          { line:"HTTPS", detail:"Encrypt in transit." },
          { line:"helmet.js", detail:"Sets security headers." },
          { line:"dependency scanning", detail:"npm audit, Snyk." }
        ], references:[{title:"OWASP Top 10",url:"https://owasp.org/www-project-top-ten/"},{title:"MDN — web security",url:"https://developer.mozilla.org/en-US/docs/Web/Security"},{title:"OWASP cheatsheets",url:"https://cheatsheetseries.owasp.org/"}] },
        { id:"web-x3", title:"Deployment and CI/CD", why:"Ship reliably and repeatedly. Automate everything.", how:"Build, test, deploy via a pipeline; containers (Docker) give reproducible environments.", explain:[
          { line:"Dockerfile", detail:"Recipe for an image." },
          { line:"GitHub Actions", detail:"Run tests and deploy on push." },
          { line:"environment variables", detail:"Config and secrets outside code." },
          { line:"rollback", detail:"Keep previous version deployable." },
          { line:"blue/green deploy", detail:"Switch traffic between two identical environments." },
          { line:"monitoring", detail:"Logs, metrics, alerts (Datadog, Sentry)." }
        ], references:[{title:"Docker docs",url:"https://docs.docker.com/get-started/"},{title:"GitHub Actions",url:"https://docs.github.com/en/actions"},{title:"12-factor app",url:"https://12factor.net/"}] },
        { id:"web-x4", title:"Real-time and WebSockets", why:"Live updates: chat, notifications, collaboration.", how:"WebSockets upgrade HTTP to a persistent bidirectional connection.", explain:[
          { line:"new WebSocket(url)", detail:"Open a connection." },
          { line:"ws.onmessage", detail:"Handle incoming messages." },
          { line:"ws.send(data)", detail:"Send a message." },
          { line:"Socket.io", detail:"Fallbacks and rooms on top of WebSockets." },
          { line:"Server-Sent Events", detail:"One-way server→client stream over HTTP." },
          { line:"scaling", detail:"Sticky sessions or a pub/sub (Redis) for multi-server." }
        ], references:[{title:"WebSocket (MDN)",url:"https://developer.mozilla.org/en-US/docs/Web/API/WebSocket"},{title:"Socket.io",url:"https://socket.io/docs/v4/"},{title:"SSE (MDN)",url:"https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events"}] }
      ]}
    }
  },

  "sql": {
    title: "SQL",
    overview: "The language of relational data. Learn to ask precise questions of tables and to make them fast. Scales from basic SELECT to query optimisation and transactions.",
    levels: {
      beginner: { roadmap: [
        { id:"sql-b1", title:"SELECT and filtering", why:"Read data with conditions. The most common operation.", how:"FROM picks the table, WHERE filters rows, SELECT picks columns.", explain:[
          { line:"SELECT name, age FROM users", detail:"Project two columns." },
          { line:"WHERE age >= 18", detail:"Filter rows." },
          { line:"ORDER BY age DESC", detail:"Sort the result." },
          { line:"LIMIT 10", detail:"Return only the first 10 rows." },
          { line:"DISTINCT", detail:"Remove duplicate rows." },
          { line:"AS alias", detail:"Rename a column in the output." }
        ], references:[{title:"SQL SELECT",url:"https://www.w3schools.com/sql/sql_select.asp"},{title:"PostgreSQL SELECT",url:"https://www.postgresql.org/docs/current/sql-select.html"},{title:"SQLBolt",url:"https://sqlbolt.com/"}] },
        { id:"sql-b2", title:"INSERT, UPDATE, DELETE", why:"Write and change data. Every app needs this.", how:"INSERT adds rows; UPDATE changes existing rows; DELETE removes them. Always filter writes.", explain:[
          { line:"INSERT INTO users(name,age) VALUES('A',20)", detail:"Add a row." },
          { line:"UPDATE users SET age=21 WHERE id=1", detail:"Change one row." },
          { line:"DELETE FROM users WHERE id=1", detail:"Remove one row." },
          { line:"transaction", detail:"BEGIN ... COMMIT; roll back on error." },
          { line:"RETURNING", detail:"Get the inserted/updated row back." },
          { line:"ON CONFLICT", detail:"Upsert: insert or update on conflict." }
        ], references:[{title:"SQL INSERT",url:"https://www.w3schools.com/sql/sql_insert.asp"},{title:"SQL UPDATE",url:"https://www.w3schools.com/sql/sql_update.asp"},{title:"SQL DELETE",url:"https://www.w3schools.com/sql/sql_delete.asp"}] },
        { id:"sql-b3", title:"Aggregation", why:"Summarise data: counts, sums, averages. Essential for reporting.", how:"GROUP BY collapses rows by a key; aggregate functions compute per group; HAVING filters groups.", explain:[
          { line:"COUNT(*), SUM(x), AVG(x)", detail:"Common aggregates." },
          { line:"GROUP BY country", detail:"One row per country." },
          { line:"HAVING COUNT(*) > 5", detail:"Filter groups (after aggregation)." },
          { line:"WHERE vs HAVING", detail:"WHERE filters rows before grouping." },
          { line:"MIN / MAX", detail:"Smallest and largest values." },
          { line:"GROUP BY ROLLUP/CUBE", detail:"Subtotals and grand totals." }
        ], references:[{title:"SQL GROUP BY",url:"https://www.w3schools.com/sql/sql_groupby.asp"},{title:"SQL HAVING",url:"https://www.w3schools.com/sql/sql_having.asp"},{title:"PostgreSQL aggregates",url:"https://www.postgresql.org/docs/current/functions-aggregate.html"}] },
        { id:"sql-b4", title:"Data types and constraints", why:"Correct types and constraints prevent bad data.", how:"Choose types that match the data; add constraints to enforce rules at the DB level.", explain:[
          { line:"INTEGER, TEXT, BOOLEAN", detail:"Basic types." },
          { line:"VARCHAR(n), CHAR(n)", detail:"Variable/fixed length strings." },
          { line:"TIMESTAMP, DATE", detail:"Date and time." },
          { line:"PRIMARY KEY", detail:"Unique identifier for a row." },
          { line:"FOREIGN KEY", detail:"References another table; enforces referential integrity." },
          { line:"NOT NULL, UNIQUE, CHECK", detail:"Column-level constraints." }
        ], references:[{title:"SQL data types",url:"https://www.w3schools.com/sql/sql_datatypes.asp"},{title:"Constraints",url:"https://www.w3schools.com/sql/sql_constraints.asp"},{title:"PostgreSQL types",url:"https://www.postgresql.org/docs/current/datatype.html"}] }
      ]},
      medium: { roadmap: [
        { id:"sql-m1", title:"JOINs", why:"Combine tables. Most real queries join.", how:"INNER JOIN keeps matching rows; LEFT JOIN keeps all left rows; join on a key.", explain:[
          { line:"JOIN orders ON users.id = orders.user_id", detail:"Match users to their orders." },
          { line:"INNER JOIN", detail:"Only rows present in both tables." },
          { line:"LEFT JOIN", detail:"All left rows; NULL where no match." },
          { line:"self-join", detail:"Join a table to itself (e.g. employee/manager)." },
          { line:"FULL OUTER JOIN", detail:"All rows from both tables." },
          { line:"CROSS JOIN", detail:"Cartesian product." }
        ], references:[{title:"SQL JOIN",url:"https://www.w3schools.com/sql/sql_join.asp"},{title:"SQL LEFT JOIN",url:"https://www.w3schools.com/sql/sql_join_left.asp"},{title:"SQL JOINs (visual)",url:"https://www.sql-join.com/"}] },
        { id:"sql-m2", title:"Subqueries and CTEs", why:"Break complex queries into readable steps.", how:"A subquery is a query inside a query. A CTE (WITH) names a temporary result set.", explain:[
          { line:"WHERE id IN (SELECT user_id FROM orders)", detail:"Subquery in a filter." },
          { line:"WITH cte AS (...)", detail:"Named temporary result." },
          { line:"WITH RECURSIVE", detail:"For trees and graphs stored as adjacency." },
          { line:"readability", detail:"CTEs read top-down; nested subqueries do not." },
          { line:"correlated subquery", detail:"References the outer query." },
          { line:"EXISTS", detail:"True if the subquery returns any row." }
        ], references:[{title:"SQL subqueries",url:"https://www.w3schools.com/sql/sql_subqueries.asp"},{title:"CTE",url:"https://www.postgresql.org/docs/current/queries-with.html"},{title:"Mode — CTEs",url:"https://mode.com/sql-tutorial/sql-ctes/"}] },
        { id:"sql-m3", title:"Indexes", why:"Make queries fast without rewriting them.", how:"An index is a sorted structure on one or more columns. The planner uses it when it helps.", explain:[
          { line:"CREATE INDEX idx ON users(email)", detail:"Index a column." },
          { line:"EXPLAIN ANALYZE", detail:"Shows the plan and timings." },
          { line:"composite index", detail:"Index on (a,b) helps queries filtering on a, or a and b." },
          { line:"write cost", detail:"Indexes slow writes; add them deliberately." },
          { line:"covering index", detail:"Index contains all columns needed; index-only scan." },
          { line:"partial index", detail:"Index a subset of rows." }
        ], references:[{title:"SQL CREATE INDEX",url:"https://www.w3schools.com/sql/sql_create_index.asp"},{title:"Use the index, Luke",url:"https://use-the-index-luke.com/"},{title:"PostgreSQL indexes",url:"https://www.postgresql.org/docs/current/indexes.html"}] },
        { id:"sql-m4", title:"Views and materialised views", why:"Encapsulate complex queries. Materialised views cache results.", how:"A view is a stored query. A materialised view stores the result and must be refreshed.", explain:[
          { line:"CREATE VIEW v AS SELECT ...", detail:"Define a view." },
          { line:"SELECT * FROM v", detail:"Query the view like a table." },
          { line:"CREATE MATERIALIZED VIEW mv AS ...", detail:"Store the result." },
          { line:"REFRESH MATERIALIZED VIEW mv", detail:"Recompute the cached result." },
          { line:"updatable views", detail:"Simple views allow INSERT/UPDATE/DELETE." },
          { line:"security", detail:"Views can restrict column/row access." }
        ], references:[{title:"Views (PostgreSQL)",url:"https://www.postgresql.org/docs/current/sql-createview.html"},{title:"Materialized views",url:"https://www.postgresql.org/docs/current/rules-materializedviews.html"}] }
      ]},
      master: { roadmap: [
        { id:"sql-x1", title:"Window functions", why:"Rank, running totals and moving averages without collapsing rows.", how:"OVER (PARTITION BY ... ORDER BY ...) defines the window; the function computes per row.", explain:[
          { line:"ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC)", detail:"Rank within department." },
          { line:"SUM(x) OVER (ORDER BY t)", detail:"Running total." },
          { line:"LAG/LEAD", detail:"Compare with previous/next row." },
          { line:"frames", detail:"ROWS/RANGE control which rows are included." },
          { line:"NTILE(n)", detail:"Divide into n buckets." },
          { line:"FIRST_VALUE / LAST_VALUE", detail:"First/last in the window." }
        ], references:[{title:"Window functions",url:"https://www.postgresql.org/docs/current/tutorial-window.html"},{title:"Mode — window functions",url:"https://mode.com/sql-tutorial/sql-window-functions/"},{title:"PostgreSQL window functions",url:"https://www.postgresql.org/docs/current/functions-window.html"}] },
        { id:"sql-x2", title:"Query optimisation", why:"Same result, very different cost. The difference between 1ms and 10s.", how:"Read the plan, add indexes, avoid SELECT *, push filters down, avoid functions on indexed columns.", explain:[
          { line:"EXPLAIN (ANALYZE, BUFFERS)", detail:"Actual timings and I/O." },
          { line:"seq scan vs index scan", detail:"Planner chooses based on selectivity." },
          { line:"sargable predicates", detail:"WHERE col = 5 uses an index; WHERE UPPER(col) = 'X' may not." },
          { line:"N+1 problem", detail:"One query per row; fix with a JOIN." },
          { line:"covering index", detail:"Avoid heap fetches." },
          { line:"vacuum / analyze", detail:"Keep statistics fresh." }
        ], references:[{title:"Query planning",url:"https://www.postgresql.org/docs/current/planner-optimizer.html"},{title:"Use the index, Luke",url:"https://use-the-index-luke.com/"},{title:"EXPLAIN (PostgreSQL)",url:"https://www.postgresql.org/docs/current/sql-explain.html"}] },
        { id:"sql-x3", title:"Transactions and isolation", why:"Correctness under concurrency. ACID guarantees.", how:"ACID: atomicity, consistency, isolation, durability. Isolation levels trade correctness for throughput.", explain:[
          { line:"BEGIN ... COMMIT", detail:"All or nothing." },
          { line:"ROLLBACK", detail:"Undo on failure." },
          { line:"isolation levels", detail:"Read committed, repeatable read, serializable." },
          { line:"deadlock", detail:"Two transactions wait on each other; one is aborted." },
          { line:"SELECT FOR UPDATE", detail:"Lock rows for update." },
          { line:"MVCC", detail:"Multi-version concurrency control; readers don't block writers." }
        ], references:[{title:"Transactions (PostgreSQL)",url:"https://www.postgresql.org/docs/current/tutorial-transactions.html"},{title:"Isolation levels",url:"https://www.postgresql.org/docs/current/transaction-iso.html"},{title:"MVCC",url:"https://www.postgresql.org/docs/current/mvcc.html"}] },
        { id:"sql-x4", title:"Advanced: JSON, full-text, partitions", why:"Modern PostgreSQL is more than tables. Handle semi-structured data and scale.", how:"JSONB for documents, tsvector for full-text search, partitioning for large tables.", explain:[
          { line:"jsonb column", detail:"Store and query JSON documents." },
          { line:"-> and ->>", detail:"Extract JSON fields." },
          { line:"GIN index on jsonb", detail:"Index JSON for fast containment queries." },
          { line:"tsvector / tsquery", detail:"Full-text search." },
          { line:"partitioning", detail:"Split large tables by range/list/hash." },
          { line:"table inheritance", detail:"PostgreSQL-specific polymorphism." }
        ], references:[{title:"JSON functions",url:"https://www.postgresql.org/docs/current/functions-json.html"},{title:"Full-text search",url:"https://www.postgresql.org/docs/current/textsearch.html"},{title:"Partitioning",url:"https://www.postgresql.org/docs/current/ddl-partitioning.html"}] }
      ]}
    }
  },

  "physics": {
    title: "Physics — Mechanics",
    overview: "Motion, force and energy. The subject rewards drawing a free-body diagram before touching an equation. Scales from kinematics to Lagrangian mechanics.",
    levels: {
      beginner: { roadmap: [
        { id:"ph-b1", title:"Kinematics", why:"Describe motion without asking why. The starting point of mechanics.", how:"Position, velocity and acceleration are linked by calculus; for constant acceleration use the suvat equations.", explain:[
          { line:"v = u + at", detail:"Velocity after time t." },
          { line:"s = ut + ½at²", detail:"Displacement after time t." },
          { line:"v² = u² + 2as", detail:"Relates velocity and displacement without time." },
          { line:"projectiles", detail:"Horizontal motion is uniform; vertical motion is accelerated." },
          { line:"relative velocity", detail:"v_A/B = v_A - v_B." },
          { line:"graphs", detail:"Slope of x-t is v; slope of v-t is a; area under v-t is displacement." }
        ], references:[{title:"Kinematics (Khan)",url:"https://www.khanacademy.org/science/physics/one-dimensional-motion"},{title:"HyperPhysics — kinematics",url:"http://hyperphysics.phy-astr.gsu.edu/hbase/mot.html"},{title:"Physics Classroom — kinematics",url:"https://www.physicsclassroom.com/class/1DKin"}] },
        { id:"ph-b2", title:"Newton's laws", why:"Force causes acceleration. The core principle of mechanics.", how:"Draw the free-body diagram, then write F_net = m a along each axis.", explain:[
          { line:"F = ma", detail:"Net force equals mass times acceleration." },
          { line:"action = reaction", detail:"Forces come in pairs on different bodies." },
          { line:"friction", detail:"Static (prevents slip) and kinetic (opposes motion)." },
          { line:"free-body diagram", detail:"The single most useful habit in mechanics." },
          { line:"equilibrium", detail:"ΣF = 0 → no acceleration." },
          { line:"apparent weight", detail:"Normal force in an accelerating frame." }
        ], references:[{title:"Newton's laws (Khan)",url:"https://www.khanacademy.org/science/physics/forces-newtons-laws"},{title:"HyperPhysics — forces",url:"http://hyperphysics.phy-astr.gsu.edu/hbase/N2st.html"},{title:"Physics Classroom — Newton",url:"https://www.physicsclassroom.com/class/newtlaws"}] },
        { id:"ph-b3", title:"Work and energy", why:"A scalar accounting that bypasses time. Often simpler than forces.", how:"Work = force × displacement (dot product). Kinetic energy = ½mv². Conservative forces have a potential energy.", explain:[
          { line:"W = F·d", detail:"Only the component along displacement counts." },
          { line:"KE = ½mv²", detail:"Energy of motion." },
          { line:"PE = mgh", detail:"Gravitational potential energy near Earth." },
          { line:"conservation", detail:"In an isolated system, total energy is constant." },
          { line:"work-energy theorem", detail:"W_net = ΔKE." },
          { line:"power", detail:"P = W/t = F·v." }
        ], references:[{title:"Work and energy (Khan)",url:"https://www.khanacademy.org/science/physics/work-and-energy"},{title:"HyperPhysics — energy",url:"http://hyperphysics.phy-astr.gsu.edu/hbase/enecon.html"},{title:"Physics Classroom — work",url:"https://www.physicsclassroom.com/class/energy"}] },
        { id:"ph-b4", title:"Momentum and collisions", why:"Conservation of momentum governs collisions and explosions.", how:"p = mv. In an isolated system, total momentum is conserved. Elastic collisions conserve KE; inelastic ones don't.", explain:[
          { line:"p = mv", detail:"Momentum is mass times velocity." },
          { line:"conservation of momentum", detail:"Σp before = Σp after (isolated system)." },
          { line:"elastic collision", detail:"Both momentum and KE conserved." },
          { line:"inelastic collision", detail:"Momentum conserved; KE lost to heat/deformation." },
          { line:"impulse", detail:"J = FΔt = Δp." },
          { line:"centre of mass", detail:"The point that moves as if all mass were there." }
        ], references:[{title:"Momentum (Khan)",url:"https://www.khanacademy.org/science/physics/linear-momentum"},{title:"HyperPhysics — momentum",url:"http://hyperphysics.phy-astr.gsu.edu/hbase/mom.html"},{title:"Physics Classroom — momentum",url:"https://www.physicsclassroom.com/class/momentum"}] }
      ]},
      medium: { roadmap: [
        { id:"ph-m1", title:"Rotational dynamics", why:"Torque and moment of inertia are the rotational analogues of force and mass.", how:"τ = I α. Angular momentum L = Iω is conserved when net torque is zero.", explain:[
          { line:"τ = r × F", detail:"Torque depends on the lever arm." },
          { line:"I = Σ m r²", detail:"Moment of inertia." },
          { line:"L = Iω", detail:"Angular momentum." },
          { line:"conservation of L", detail:"Explains gyroscopes, spinning skaters, orbits." },
          { line:"rotational KE = ½Iω²", detail:"Energy of spinning." },
          { line:"rolling without slipping", detail:"v = rω; combines translation and rotation." }
        ], references:[{title:"Rotation (Khan)",url:"https://www.khanacademy.org/science/physics/torque-angular-momentum"},{title:"HyperPhysics — rotation",url:"http://hyperphysics.phy-astr.gsu.edu/hbase/rotq.html"},{title:"Physics Classroom — circular",url:"https://www.physicsclassroom.com/class/circles"}] },
        { id:"ph-m2", title:"Oscillations", why:"Restoring forces produce sinusoidal motion; resonance is everywhere.", how:"x'' + ω²x = 0 gives x = A cos(ωt+φ). Energy sloshes between kinetic and potential.", explain:[
          { line:"ω = √(k/m)", detail:"Mass-spring frequency." },
          { line:"T = 2π/ω", detail:"Period is independent of amplitude (small angles)." },
          { line:"damping", detail:"Friction reduces amplitude exponentially." },
          { line:"resonance", detail:"Driving at the natural frequency amplifies motion." },
          { line:"pendulum", detail:"T = 2π√(L/g) for small angles." },
          { line:"phase", detail:"x and v are 90° out of phase." }
        ], references:[{title:"Oscillations (Khan)",url:"https://www.khanacademy.org/science/physics/simple-harmonic-motion"},{title:"HyperPhysics — SHM",url:"http://hyperphysics.phy-astr.gsu.edu/hbase/shm.html"},{title:"Physics Classroom — waves",url:"https://www.physicsclassroom.com/class/waves"}] },
        { id:"ph-m3", title:"Electrostatics", why:"Charges create fields and forces; the basis of all electronics.", how:"Coulomb's law gives the force; integrate to get fields and potentials.", explain:[
          { line:"F = k q1 q2 / r²", detail:"Inverse-square force." },
          { line:"E = F/q", detail:"Field is force per unit test charge." },
          { line:"V = kq/r", detail:"Potential (scalar) from a point charge." },
          { line:"capacitance", detail:"C = Q/V; stores charge." },
          { line:"Gauss's law", detail:"Φ = Q_enclosed/ε₀; exploits symmetry." },
          { line:"conductors", detail:"Charges reside on the surface; field inside is zero." }
        ], references:[{title:"Electrostatics (Khan)",url:"https://www.khanacademy.org/science/physics/electric-charge-electric-force"},{title:"HyperPhysics — electrostatics",url:"http://hyperphysics.phy-astr.gsu.edu/hbase/electric.html"},{title:"Physics Classroom — electrostatics",url:"https://www.physicsclassroom.com/class/estatics"}] },
        { id:"ph-m4", title:"Waves", why:"Propagating oscillations: sound, light, signals.", how:"y = A sin(kx - ωt). Superposition: waves add. Interference and standing waves arise.", explain:[
          { line:"v = fλ", detail:"Wave speed = frequency × wavelength." },
          { line:"superposition", detail:"Waves pass through each other; displacements add." },
          { line:"standing wave", detail:"Fixed nodes; resonant modes of a string/pipe." },
          { line:"Doppler effect", detail:"Frequency shifts when source/observer move." },
          { line:"interference", detail:"Constructive (in phase) and destructive (out of phase)." },
          { line:"diffraction", detail:"Waves bend around obstacles." }
        ], references:[{title:"Waves (Khan)",url:"https://www.khanacademy.org/science/physics/mechanical-waves-and-sound"},{title:"HyperPhysics — waves",url:"http://hyperphysics.phy-astr.gsu.edu/hbase/waves.html"},{title:"Physics Classroom — waves",url:"https://www.physicsclassroom.com/class/waves"}] }
      ]},
      master: { roadmap: [
        { id:"ph-x1", title:"Lagrangian mechanics", why:"A more powerful, coordinate-free way to derive equations of motion.", how:"Define L = T - V. The Euler-Lagrange equations give the equations of motion for any coordinates.", explain:[
          { line:"L = T - V", detail:"Lagrangian = kinetic minus potential." },
          { line:"d/dt (∂L/∂q̇) = ∂L/∂q", detail:"Euler-Lagrange equation." },
          { line:"generalised coordinates", detail:"Choose coordinates that fit the constraints." },
          { line:"conserved quantities", detail:"If L has no explicit time dependence, energy is conserved." },
          { line:"Noether's theorem", detail:"Every symmetry gives a conserved quantity." },
          { line:"constraints", detail:"Holonomic constraints reduce degrees of freedom." }
        ], references:[{title:"Lagrangian mechanics",url:"https://en.wikipedia.org/wiki/Lagrangian_mechanics"},{title:"MIT OCW — classical mechanics",url:"https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/"},{title:"Goldstein — Classical Mechanics",url:"https://www.amazon.com/Classical-Mechanics-Herbert-Goldstein/dp/0201657023"}] },
        { id:"ph-x2", title:"Special relativity", why:"At high speeds, Newtonian mechanics breaks down.", how:"Two postulates: laws of physics are the same in all inertial frames, and c is constant. Consequences: time dilation, length contraction, E=mc².", explain:[
          { line:"γ = 1/√(1-v²/c²)", detail:"Lorentz factor." },
          { line:"time dilation", detail:"Moving clocks run slow." },
          { line:"length contraction", detail:"Moving objects are shorter along motion." },
          { line:"E = mc²", detail:"Mass-energy equivalence." },
          { line:"spacetime interval", detail:"Invariant: c²Δt² - Δx²." },
          { line:"relativistic momentum", detail:"p = γmv." }
        ], references:[{title:"Special relativity (Khan)",url:"https://www.khanacademy.org/science/physics/special-relativity"},{title:"HyperPhysics — relativity",url:"http://hyperphysics.phy-astr.gsu.edu/hbase/relativ.html"},{title:"MIT OCW — special relativity",url:"https://ocw.mit.edu/courses/8-20-introduction-to-special-relativity-january-iap-2021/"}] },
        { id:"ph-x3", title:"Hamiltonian mechanics", why:"The foundation of quantum mechanics and statistical physics.", how:"Transform from (q, q̇) to (q, p) via Legendre transform. Hamilton's equations are first-order and symmetric.", explain:[
          { line:"H = p·q̇ - L", detail:"Hamiltonian = total energy (for scleronomic systems)." },
          { line:"q̇ = ∂H/∂p", detail:"First Hamilton equation." },
          { line:"ṗ = -∂H/∂q", detail:"Second Hamilton equation." },
          { line:"phase space", detail:"2n-dimensional space of (q, p)." },
          { line:"Poisson brackets", detail:"{f,g} = ∂f/∂q ∂g/∂p - ∂f/∂p ∂g/∂q." },
          { line:"canonical transformation", detail:"Preserves Hamilton's equations." }
        ], references:[{title:"Hamiltonian mechanics",url:"https://en.wikipedia.org/wiki/Hamiltonian_mechanics"},{title:"Goldstein — Classical Mechanics",url:"https://www.amazon.com/Classical-Mechanics-Herbert-Goldstein/dp/0201657023"}] }
      ]}
    }
  },

  "javascript": {
    title: "JavaScript",
    overview: "The language of the web. Runs in every browser and on the server via Node. The roadmap goes from variables to the event loop and async patterns.",
    levels: {
      beginner: { roadmap: [
        { id:"js-b1", title:"Variables and types", why:"Store and reuse values. The starting point of every program.", how:"let/const declare variables; var is legacy. JS is dynamically typed.", explain:[
          { line:"let x = 5;", detail:"Block-scoped variable; can be reassigned." },
          { line:"const PI = 3.14;", detail:"Block-scoped constant; cannot be reassigned." },
          { line:"typeof x", detail:"Returns the type as a string." },
          { line:"null vs undefined", detail:"null is intentional absence; undefined means not assigned." },
          { line:"template literals", detail:"`Hello ${name}` — string interpolation." },
          { line:"== vs ===", detail:"== coerces types; === is strict. Always use ===." }
        ], references:[{title:"MDN — JavaScript",url:"https://developer.mozilla.org/en-US/docs/Web/JavaScript"},{title:"javascript.info — variables",url:"https://javascript.info/variables"},{title:"MDN — data types",url:"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures"}] },
        { id:"js-b2", title:"Functions and scope", why:"Reuse logic and control visibility.", how:"function declarations are hoisted; arrow functions are concise and lexically bind this.", explain:[
          { line:"function add(a,b){return a+b}", detail:"Function declaration; hoisted." },
          { line:"const add = (a,b) => a+b", detail:"Arrow function; concise." },
          { line:"scope", detail:"Block, function, and global scope." },
          { line:"closure", detail:"A function remembers its creation environment." },
          { line:"this", detail:"Depends on call site; arrow functions inherit this." },
          { line:"hoisting", detail:"Declarations moved to top of scope." }
        ], references:[{title:"MDN — functions",url:"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions"},{title:"javascript.info — functions",url:"https://javascript.info/function-basics"},{title:"javascript.info — closures",url:"https://javascript.info/closure"}] },
        { id:"js-b3", title:"Arrays and objects", why:"The two main data structures in JS.", how:"Arrays are ordered lists; objects are key-value maps. Both are objects.", explain:[
          { line:"const arr = [1,2,3]", detail:"Array literal." },
          { line:"arr.map(x => x*2)", detail:"Transform each element; returns new array." },
          { line:"arr.filter(x => x>1)", detail:"Keep elements passing a test." },
          { line:"const obj = {a:1}", detail:"Object literal." },
          { line:"obj.a or obj['a']", detail:"Property access (dot or bracket)." },
          { line:"Object.keys(obj)", detail:"Array of keys." }
        ], references:[{title:"MDN — arrays",url:"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array"},{title:"MDN — objects",url:"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object"},{title:"javascript.info — arrays",url:"https://javascript.info/array"}] },
        { id:"js-b4", title:"DOM and events", why:"Make pages interactive. The bridge between JS and HTML.", how:"Select elements, change them, listen for events.", explain:[
          { line:"document.querySelector('.btn')", detail:"Find first matching element." },
          { line:"el.textContent = 'hi'", detail:"Change text." },
          { line:"el.classList.add('active')", detail:"Toggle a class." },
          { line:"el.addEventListener('click', fn)", detail:"Run fn on click." },
          { line:"event.target", detail:"The element that triggered the event." },
          { line:"event.preventDefault()", detail:"Stop default behaviour (e.g. form submit)." }
        ], references:[{title:"MDN — DOM",url:"https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model"},{title:"MDN — events",url:"https://developer.mozilla.org/en-US/docs/Web/Events"},{title:"javascript.info — DOM",url:"https://javascript.info/document"}] }
      ]},
      medium: { roadmap: [
        { id:"js-m1", title:"Promises and async/await", why:"Handle asynchronous operations (network, timers) cleanly.", how:"A promise represents a future value. async/await makes async code look synchronous.", explain:[
          { line:"new Promise((resolve,reject) => ...)", detail:"Create a promise." },
          { line:".then(x => ...).catch(e => ...)", detail:"Chain handlers." },
          { line:"async function f() { ... }", detail:"Declares an async function." },
          { line:"const x = await fetch(url)", detail:"Wait for the promise to resolve." },
          { line:"Promise.all([p1,p2])", detail:"Wait for all; fail if any fails." },
          { line:"Promise.allSettled", detail:"Wait for all; never rejects." }
        ], references:[{title:"MDN — promises",url:"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise"},{title:"javascript.info — async",url:"https://javascript.info/async"},{title:"MDN — async/await",url:"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function"}] },
        { id:"js-m2", title:"Classes and modules", why:"Organise code into reusable, maintainable units.", how:"class syntax over prototypes; ES modules (import/export) for file-level code sharing.", explain:[
          { line:"class Dog { constructor(name){this.name=name} }", detail:"Class with constructor." },
          { line:"extends", detail:"Inheritance." },
          { line:"super()", detail:"Call parent constructor." },
          { line:"export default Dog", detail:"Default export." },
          { line:"import Dog from './dog.js'", detail:"Import default." },
          { line:"import { foo } from './util.js'", detail:"Named import." }
        ], references:[{title:"MDN — classes",url:"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes"},{title:"MDN — modules",url:"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules"},{title:"javascript.info — classes",url:"https://javascript.info/classes"}] },
        { id:"js-m3", title:"Fetch and APIs", why:"Talk to servers. The backbone of dynamic apps.", how:"fetch returns a promise resolving to a Response. Parse JSON, handle errors.", explain:[
          { line:"const res = await fetch(url)", detail:"Make the request." },
          { line:"const data = await res.json()", detail:"Parse JSON body." },
          { line:"res.ok", detail:"True if status 2xx." },
          { line:"fetch(url, {method:'POST', body:...})", detail:"Send data." },
          { line:"headers: {'Content-Type':'application/json'}", detail:"Set headers." },
          { line:"AbortController", detail:"Cancel a fetch." }
        ], references:[{title:"MDN — fetch",url:"https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API"},{title:"javascript.info — fetch",url:"https://javascript.info/fetch"},{title:"MDN — AbortController",url:"https://developer.mozilla.org/en-US/docs/Web/API/AbortController"}] },
        { id:"js-m4", title:"Error handling and debugging", why:"Find and fix bugs efficiently.", how:"try/catch, console, breakpoints, the debugger statement.", explain:[
          { line:"try { risky() } catch(e) { ... }", detail:"Catch exceptions." },
          { line:"finally { cleanup() }", detail:"Always runs." },
          { line:"throw new Error('msg')", detail:"Create an error." },
          { line:"console.error, console.warn", detail:"Severity levels." },
          { line:"debugger;", detail:"Pause in dev tools." },
          { line:"window.onerror", detail:"Global error handler." }
        ], references:[{title:"MDN — try/catch",url:"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch"},{title:"Chrome DevTools",url:"https://developer.chrome.com/docs/devtools/javascript/"},{title:"javascript.info — debugging",url:"https://javascript.info/debugging-chrome"}] }
      ]},
      master: { roadmap: [
        { id:"js-x1", title:"Event loop and concurrency", why:"Understand how JS handles async work. The single most important concept.", how:"Call stack, microtask queue (promises), macrotask queue (setTimeout). The event loop drains them in order.", explain:[
          { line:"call stack", detail:"Where synchronous code runs." },
          { line:"microtask queue", detail:"Promise callbacks; drained after each macrotask." },
          { line:"macrotask queue", detail:"setTimeout, setInterval, I/O." },
          { line:"rendering", detail:"Browser paints between macrotasks." },
          { line:"Web Workers", detail:"True parallelism in background threads." },
          { line:"SharedArrayBuffer", detail:"Shared memory between workers." }
        ], references:[{title:"Event loop (MDN)",url:"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop"},{title:"javascript.info — event loop",url:"https://javascript.info/event-loop"},{title:"Loupe (visualiser)",url:"http://latentflip.com/loupe/"}] },
        { id:"js-x2", title:"Prototypes and inheritance", why:"JS's object model. Classes are sugar over prototypes.", how:"Objects delegate to a prototype. Property lookup walks the chain. Prototypal inheritance is delegation.", explain:[
          { line:"Object.create(proto)", detail:"Create an object with a given prototype." },
          { line:"obj.__proto__", detail:"The prototype link (use Object.getPrototypeOf)." },
          { line:"prototype property", detail:"On functions; becomes __proto__ of instances." },
          { line:"hasOwnProperty", detail:"Check own vs inherited." },
          { line:"Object.assign", detail:"Copy properties." },
          { line:"Proxy", detail:"Intercept property access." }
        ], references:[{title:"MDN — prototypes",url:"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain"},{title:"javascript.info — prototypes",url:"https://javascript.info/prototypes"},{title:"You Don't Know JS",url:"https://github.com/getify/You-Dont-Know-JS"}] },
        { id:"js-x3", title:"Performance and memory", why:"Fast, leak-free apps. Measure, then optimise.", how:"Profiling, avoiding layout thrashing, memory management, garbage collection.", explain:[
          { line:"Performance tab", detail:"Record CPU and rendering." },
          { line:"layout thrashing", detail:"Read then write DOM in a loop; batch them." },
          { line:"requestAnimationFrame", detail:"Schedule work before paint." },
          { line:"memory leaks", detail:"Dangling references, forgotten listeners." },
          { line:"WeakMap / WeakSet", detail:"Keys can be garbage-collected." },
          { line:"lazy loading", detail:"Load code/data on demand." }
        ], references:[{title:"MDN — performance",url:"https://developer.mozilla.org/en-US/docs/Web/Performance"},{title:"Chrome DevTools performance",url:"https://developer.chrome.com/docs/devtools/performance/"},{title:"web.dev — performance",url:"https://web.dev/performance/"}] }
      ]}
    }
  },

  "git": {
    title: "Git",
    overview: "Version control for code. Track changes, collaborate, and never lose work. Scales from solo commits to team workflows.",
    levels: {
      beginner: { roadmap: [
        { id:"git-b1", title:"Basics: init, add, commit", why:"Track changes to your code. The foundation of all version control.", how:"git init creates a repo; git add stages changes; git commit saves a snapshot.", explain:[
          { line:"git init", detail:"Create a new repository." },
          { line:"git add file.txt", detail:"Stage a file for commit." },
          { line:"git add .", detail:"Stage all changes." },
          { line:"git commit -m 'msg'", detail:"Save a snapshot with a message." },
          { line:"git status", detail:"See what's changed and staged." },
          { line:"git log", detail:"View commit history." }
        ], references:[{title:"Git handbook (GitHub)",url:"https://guides.github.com/introduction/git-handbook/"},{title:"Pro Git — basics",url:"https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control"},{title:"Atlassian — git basics",url:"https://www.atlassian.com/git/tutorials/what-is-version-control"}] },
        { id:"git-b2", title:"Branches", why:"Work on features without breaking main. Isolate changes.", how:"A branch is a movable pointer to a commit. Create, switch, merge.", explain:[
          { line:"git branch feature", detail:"Create a branch." },
          { line:"git checkout feature", detail:"Switch to it (or git switch)." },
          { line:"git merge feature", detail:"Merge feature into current branch." },
          { line:"git branch -d feature", detail:"Delete a merged branch." },
          { line:"merge conflict", detail:"Manual resolution when changes overlap." },
          { line:"main / master", detail:"The default branch." }
        ], references:[{title:"Git branching",url:"https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell"},{title:"Atlassian — branches",url:"https://www.atlassian.com/git/tutorials/using-branches"},{title:"Learn Git Branching",url:"https://learngitbranching.js.org/"}] },
        { id:"git-b3", title:"Remote repositories", why:"Collaborate and back up. Push to GitHub/GitLab.", how:"Add a remote, push commits, pull changes, clone existing repos.", explain:[
          { line:"git remote add origin URL", detail:"Link a remote." },
          { line:"git push -u origin main", detail:"Push and set upstream." },
          { line:"git pull", detail:"Fetch + merge from remote." },
          { line:"git clone URL", detail:"Copy a remote repo locally." },
          { line:"git fetch", detail:"Download without merging." },
          { line:"origin / upstream", detail:"Common remote names." }
        ], references:[{title:"Git remotes",url:"https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes"},{title:"GitHub docs",url:"https://docs.github.com/en/get-started"},{title:"Atlassian — remotes",url:"https://www.atlassian.com/git/tutorials/syncing"}] }
      ]},
      medium: { roadmap: [
        { id:"git-m1", title:"Stashing and rebasing", why:"Save work in progress and keep history clean.", how:"Stash shelves changes; rebase replays commits on a new base.", explain:[
          { line:"git stash", detail:"Shelve uncommitted changes." },
          { line:"git stash pop", detail:"Restore the latest stash." },
          { line:"git rebase main", detail:"Replay current branch on top of main." },
          { line:"interactive rebase", detail:"git rebase -i: squash, reorder, edit commits." },
          { line:"rebase vs merge", detail:"Rebase = linear history; merge = preserve topology." },
          { line:"conflicts during rebase", detail:"Resolve per commit." }
        ], references:[{title:"Git stash",url:"https://git-scm.com/book/en/v2/Git-Tools-Stashing-and-Cleaning"},{title:"Git rebase",url:"https://git-scm.com/book/en/v2/Git-Branching-Rebasing"},{title:"Atlassian — rebase",url:"https://www.atlassian.com/git/tutorials/rewriting-history/git-rebase"}] },
        { id:"git-m2", title:"Undoing changes", why:"Mistakes happen. Know how to recover.", how:"reset moves HEAD; revert creates a new commit that undoes; checkout restores files.", explain:[
          { line:"git reset --soft HEAD~1", detail:"Undo commit, keep changes staged." },
          { line:"git reset --hard HEAD~1", detail:"Undo commit and discard changes (dangerous)." },
          { line:"git revert HEAD", detail:"Create a new commit that undoes HEAD." },
          { line:"git checkout -- file", detail:"Discard working-tree changes to a file." },
          { line:"git reflog", detail:"History of HEAD; recover 'lost' commits." },
          { line:"git reset HEAD file", detail:"Unstage a file." }
        ], references:[{title:"Undoing things",url:"https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things"},{title:"Atlassian — resetting",url:"https://www.atlassian.com/git/tutorials/undoing-changes"},{title:"Git reflog",url:"https://git-scm.com/docs/git-reflog"}] },
        { id:"git-m3", title:"Tags and releases", why:"Mark versions. Essential for shipping.", how:"Lightweight tags are pointers; annotated tags are full objects with metadata.", explain:[
          { line:"git tag v1.0", detail:"Lightweight tag." },
          { line:"git tag -a v1.0 -m 'msg'", detail:"Annotated tag." },
          { line:"git push origin v1.0", detail:"Push a tag." },
          { line:"git push --tags", detail:"Push all tags." },
          { line:"semantic versioning", detail:"MAJOR.MINOR.PATCH." },
          { line:"GitHub releases", detail:"Attach binaries to a tag." }
        ], references:[{title:"Git tagging",url:"https://git-scm.com/book/en/v2/Git-Basics-Tagging"},{title:"Semantic versioning",url:"https://semver.org/"},{title:"GitHub releases",url:"https://docs.github.com/en/repositories/releasing-projects-on-github"}] }
      ]},
      master: { roadmap: [
        { id:"git-x1", title:"Git internals", why:"Understand the object model. Makes everything else click.", how:"Git stores blobs (files), trees (directories), commits (snapshots), and tags. All content-addressed by SHA-1.", explain:[
          { line:".git/objects", detail:"Content-addressed storage." },
          { line:"blob", detail:"File contents." },
          { line:"tree", detail:"Directory listing." },
          { line:"commit", detail:"Snapshot + parent + metadata." },
          { line:"HEAD", detail:"Pointer to current branch." },
          { line:"pack files", detail:"Compressed object storage." }
        ], references:[{title:"Git internals",url:"https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain"},{title:"Git objects",url:"https://git-scm.com/book/en/v2/Git-Internals-Git-Objects"}] },
        { id:"git-x2", title:"Advanced workflows", why:"Handle complex team scenarios.", how:"Cherry-pick, bisect, worktrees, submodules.", explain:[
          { line:"git cherry-pick <sha>", detail:"Apply a single commit." },
          { line:"git bisect", detail:"Binary search for the commit that introduced a bug." },
          { line:"git worktree", detail:"Multiple working directories from one repo." },
          { line:"git submodule", detail:"Embed another repo." },
          { line:"git filter-repo", detail:"Rewrite history (e.g. remove a file)." },
          { line:"git hooks", detail:"Scripts triggered by git events." }
        ], references:[{title:"Git tools",url:"https://git-scm.com/book/en/v2/Git-Tools-Revision-Selection"},{title:"git bisect",url:"https://git-scm.com/docs/git-bisect"},{title:"Git hooks",url:"https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks"}] }
      ]}
    }
  },

  "docker": {
    title: "Docker",
    overview: "Containerise applications for consistent, reproducible environments. From Dockerfile to orchestration.",
    levels: {
      beginner: { roadmap: [
        { id:"dk-b1", title:"Images and containers", why:"Package an app with all its dependencies. 'Works on my machine' becomes 'works everywhere'.", how:"An image is a read-only template; a container is a running instance. Dockerfile builds images.", explain:[
          { line:"docker run hello-world", detail:"Run a container from an image." },
          { line:"docker ps", detail:"List running containers." },
          { line:"docker images", detail:"List local images." },
          { line:"docker stop <id>", detail:"Stop a container." },
          { line:"docker rm <id>", detail:"Remove a container." },
          { line:"docker rmi <image>", detail:"Remove an image." }
        ], references:[{title:"Docker get started",url:"https://docs.docker.com/get-started/"},{title:"Docker overview",url:"https://docs.docker.com/get-started/overview/"},{title:"Play with Docker",url:"https://labs.play-with-docker.com/"}] },
        { id:"dk-b2", title:"Dockerfile", why:"Define how to build your image. The recipe.", how:"Each instruction creates a layer. Order matters for caching.", explain:[
          { line:"FROM node:18", detail:"Base image." },
          { line:"WORKDIR /app", detail:"Set working directory." },
          { line:"COPY . .", detail:"Copy files into the image." },
          { line:"RUN npm install", detail:"Run a command during build." },
          { line:"CMD ['node','app.js']", detail:"Default command when container starts." },
          { line:"EXPOSE 3000", detail:"Document the port." }
        ], references:[{title:"Dockerfile reference",url:"https://docs.docker.com/engine/reference/builder/"},{title:"Best practices",url:"https://docs.docker.com/develop/develop-images/dockerfile_best-practices/"},{title:"Docker Hub",url:"https://hub.docker.com/"}] },
        { id:"dk-b3", title:"Volumes and networking", why:"Persist data and connect containers.", how:"Volumes persist data beyond container life. Networks let containers talk.", explain:[
          { line:"docker volume create data", detail:"Create a named volume." },
          { line:"-v data:/app/data", detail:"Mount volume into container." },
          { line:"docker network create net", detail:"Create a network." },
          { line:"--network net", detail:"Attach container to network." },
          { line:"bind mount: -v $(pwd):/app", detail:"Mount host directory." },
          { line:"port mapping: -p 8080:80", detail:"Map host port to container port." }
        ], references:[{title:"Volumes",url:"https://docs.docker.com/storage/volumes/"},{title:"Networking",url:"https://docs.docker.com/network/"},{title:"Bind mounts",url:"https://docs.docker.com/storage/bind-mounts/"}] }
      ]},
      medium: { roadmap: [
        { id:"dk-m1", title:"Docker Compose", why:"Run multi-container apps with one command.", how:"A YAML file defines services, networks, volumes. docker compose up starts everything.", explain:[
          { line:"services:", detail:"Define each container." },
          { line:"build: .", detail:"Build from Dockerfile." },
          { line:"ports: ['8080:80']", detail:"Port mapping." },
          { line:"environment:", detail:"Env vars." },
          { line:"volumes:", detail:"Mount volumes." },
          { line:"depends_on:", detail:"Startup order." }
        ], references:[{title:"Compose overview",url:"https://docs.docker.com/compose/"},{title:"Compose file reference",url:"https://docs.docker.com/compose/compose-file/"},{title:"Compose tutorial",url:"https://docs.docker.com/compose/gettingstarted/"}] },
        { id:"dk-m2", title:"Multi-stage builds", why:"Smaller, more secure production images.", how:"Use multiple FROM stages; copy only what's needed from a build stage.", explain:[
          { line:"FROM node AS build", detail:"Build stage." },
          { line:"RUN npm run build", detail:"Build artifacts." },
          { line:"FROM node:alpine", detail:"Small production base." },
          { line:"COPY --from=build /app/dist .", detail:"Copy only build output." },
          { line:"result", detail:"Final image has no dev dependencies." },
          { line:".dockerignore", detail:"Exclude files from build context." }
        ], references:[{title:"Multi-stage builds",url:"https://docs.docker.com/build/building/multi-stage/"},{title:"Build cache",url:"https://docs.docker.com/build/cache/"},{title:"Dockerfile best practices",url:"https://docs.docker.com/develop/develop-images/dockerfile_best-practices/"}] },
        { id:"dk-m3", title:"Registry and CI/CD", why:"Share images and automate builds.", how:"Push to a registry (Docker Hub, ECR, GCR). CI builds and pushes on commit.", explain:[
          { line:"docker login", detail:"Authenticate to a registry." },
          { line:"docker tag img user/img:tag", detail:"Tag for a registry." },
          { line:"docker push user/img:tag", detail:"Upload." },
          { line:"GitHub Actions + docker/build-push-action", detail:"Automate builds." },
          { line:"image scanning", detail:"Trivy, Snyk for vulnerabilities." },
          { line:"semver tags", detail:"Version your images." }
        ], references:[{title:"Registry",url:"https://docs.docker.com/registry/"},{title:"GitHub Actions docker",url:"https://docs.github.com/en/actions/publishing-packages/publishing-docker-images"},{title:"Trivy",url:"https://aquasecurity.github.io/trivy/"}] }
      ]},
      master: { roadmap: [
        { id:"dk-x1", title:"Kubernetes basics", why:"Orchestrate containers at scale. The industry standard.", how:"Pods, deployments, services, ingress. Declarative YAML, reconciled by controllers.", explain:[
          { line:"Pod", detail:"Smallest deployable unit; one or more containers." },
          { line:"Deployment", detail:"Manages replica sets; rolling updates." },
          { line:"Service", detail:"Stable network endpoint for pods." },
          { line:"Ingress", detail:"HTTP routing into the cluster." },
          { line:"ConfigMap / Secret", detail:"Configuration and secrets." },
          { line:"kubectl apply -f", detail:"Declarative management." }
        ], references:[{title:"Kubernetes docs",url:"https://kubernetes.io/docs/home/"},{title:"Kubernetes basics",url:"https://kubernetes.io/docs/tutorials/kubernetes-basics/"},{title:"kubectl cheatsheet",url:"https://kubernetes.io/docs/reference/kubectl/cheatsheet/"}] },
        { id:"dk-x2", title:"Observability", why:"Know what your containers are doing. Logs, metrics, traces.", how:"Structured logging, Prometheus metrics, distributed tracing (Jaeger/OTel).", explain:[
          { line:"docker logs", detail:"View container logs." },
          { line:"Prometheus", detail:"Time-series metrics." },
          { line:"Grafana", detail:"Dashboards." },
          { line:"OpenTelemetry", detail:"Standard for traces/metrics/logs." },
          { line:"health checks", detail:"liveness and readiness probes." },
          { line:"resource limits", detail:"CPU/memory requests and limits." }
        ], references:[{title:"Docker logging",url:"https://docs.docker.com/config/containers/logging/"},{title:"Prometheus",url:"https://prometheus.io/docs/introduction/overview/"},{title:"OpenTelemetry",url:"https://opentelemetry.io/docs/"}] }
      ]}
    }
  }
};

window.PACKS = PACKS;