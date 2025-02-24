/* -------------------------------------------------------------------------------
This code is licensed under MIT License.

Copyright (c) 2019 I Putu Prema Ananda D.N

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
---------------------------------------------------------------------------------- */

/* eslint-disable no-restricted-globals */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable no-lonely-if */
/* eslint-disable no-else-return */
/* eslint-disable brace-style */
/* eslint-disable func-names */

let root = null;
let lastState = null;
let msg = '';
let printOutput = '';
let canvasWidth;
let delay = 1000;

class Node {
  constructor(d, height, y, parent, loc) {
    if (d instanceof Node) { // if parameter passed is a node then use all properties of the node to be cloned for the new node
      this.data = d.data;
      this.left = d.left;
      this.right = d.right;
      this.parent = d.parent;
      this.loc = d.loc;
      this.height = d.height;
      this.x = d.x;
      this.y = d.y;
      this.highlighted = d.highlighted;
    }
    else {
      this.data = d;
      this.left = null;
      this.right = null;
      this.parent = parent;
      this.loc = loc;
      this.height = height;
      this.x = canvasWidth / 2;
      this.y = y;
      this.highlighted = false;
    }
  }
}

// CLONE THE CURRENT TREE INCLUDING ITS CHILD AND THE CHILD OF ITS CHILD AND SO ON..
function treeClone(node) {
  if (node == null) return null;
  const neww = new Node(node);
  neww.left = treeClone(node.left);
  neww.right = treeClone(node.right);
  return neww;
}

// DELAY CODE EXECUTION FOR SPECIFIED MILLISECONDS
function sleep(ms) {
  const start = Date.now();
  while (Date.now() < start + ms);
}

// UNHIGHLIGHT ALL NODES
function unhighlightAll(node) {
  if (node !== null) {
    node.highlighted = false;
    unhighlightAll(node.left);
    unhighlightAll(node.right);
  }
}

// GET CURRENT HEIGHT/LEVEL OF A NODE
function getHeight(node) {
  if (node == null) return 0;
  return node.height;
}

function comparator(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
}


function rightRotate(node) {
  let y = node;
  let yParent = node.parent;
  let x = y.left;
  let T2 = x.right;


  x.right = y;
  y.loc = "right";
  y.parent = x;

  y.left = T2;

  if (T2 != null) {
    T2.parent = y;
    T2.loc = "left";
  }

  x.parent = yParent;

  if (x.parent != null) {
    if (x.parent.left == y) {
      x.parent.left = x;
      x.loc = "left";
    }
    else {
      x.parent.right = x;
      x.loc = "right";
    }
  }
  return x;

}

function leftRotate(node) {
  let x = node;
  let xParent = node.parent;
  let y = x.right;
  let T2 = y.left;

  y.left = x;
  x.loc = "left";
  x.parent = y;

  x.right = T2;

  if (T2 != null) {
    T2.loc = "right";
    T2.parent = x;
  }

  y.parent = xParent;

  if (y.parent != null) {
    if (y.parent.left == x) {
      y.parent.left = y;
      y.loc = "left";
    }
    else {
      y.parent.right = y;
      y.loc = "right";
    }
  }
  return y;
}


function splay(curr) {
  if (curr == root || curr == null)
    return;


  //pictorial help for cases: https://www.geeksforgeeks.org/splay-tree-set-1-insert/

  //zig case
  if (curr.parent == root) {
    if (curr.parent.left == curr)
      root = rightRotate(root);
    else
      root = leftRotate(root);

    root.loc = "root";
    return;
  }//end of zig case

  //zig zig case
  else if (curr.parent.left == curr && curr.parent.parent.left == curr.parent) {
    if (curr.parent.parent == root) {
      //root ptr of tree will be passed by reference, so root ptr of tree will also change.
      root = rightRotate(root);
      root.loc = "root";
      root = rightRotate(root);
      root.loc = "root";
      return;
    }
    else {
      curr.parent = rightRotate(curr.parent.parent);
      curr = rightRotate(curr.parent);
      splay(curr);
      return;
    }
  } //end of zig zig case

  //zag zag case
  else if (curr.parent.right == curr && curr.parent.parent.right == curr.parent) {
    if (curr.parent.parent == root) {
      root = leftRotate(root);
      root.loc = "root";
      root = leftRotate(root);
      root.loc = "root";
      return;
    }
    else {
      curr.parent = leftRotate(curr.parent.parent);
      curr = leftRotate(curr.parent);
      splay(curr);
      return;
    }
  } //end of zag zag case

  //zag-zig cases
  else if (curr.parent.right == curr && curr.parent.parent.left == curr.parent) {
    curr = leftRotate(curr.parent);

    if (curr.parent == root) {
      root = rightRotate(root);
      root.loc = "root";
      return;
    }
    else {
      curr = rightRotate(curr.parent);
      splay(curr);
      return;

    }
  } //end of zag zig case

  //zig zag case
  else if (curr.parent.left == curr && curr.parent.parent.right == curr.parent) {
    curr = rightRotate(curr.parent);

    if (curr.parent == root) {
      root = leftRotate(root);
      root.loc = "root";
      return;
    }
    else {
      curr = leftRotate(curr.parent);
      splay(curr);
      return;

    }

  }
}//end of splay function

// SEARCH AN ELEMENT IN THE SPLAY TREE
function search(node, key) {
  if(node == null) return;
  unhighlightAll(root);
  node.highlighted = true;
  self.postMessage([root, msg, '']);
  if (node.data == key) { //key has been found, so splay the node containing this key, and then return the pointer to the value.
    msg = 'Searching for ' + key + ' : ' + key + ' == ' + node.data + '. Element found!';
    self.postMessage([root, msg, '']);
    sleep(delay);
    splay(node)
    return root;
  }

  if (node.left == null && key < node.data) { //key does not exist so splay the last accessed node
    msg = 'Searching for ' + key + ' : (Element not found)';
    self.postMessage([root, msg, '']);
    splay(node);
    return null;
  }

  else if (node.right == null && key > node.data) { //key does not exist so splay the last accessed node
    msg = 'Searching for ' + key + ' : (Element not found)';
    self.postMessage([root, msg, '']);
    splay(node);
    return null;
  }

  else if (key < node.data) {
    msg = 'Searching for ' + key + ' : ' + key + ' < ' + node.data + '. Looking at right subtree.';
    self.postMessage([root, msg, '']);
    sleep(delay);
    return search(node.left, key);
  }

  else {
    msg = 'Searching for ' + key + ' : ' + key + ' > ' + node.data + '. Looking at right subtree.';
    self.postMessage([root, msg, '']);
    sleep(delay);
    return search(node.right, key);
  }
}

// DELETE AN ELEMENT FROM THE TREE
function pop(startingNode, key) {
  let node = startingNode;
  if (!node) { // if current node is null then element to delete does not exist in the tree
    msg = 'Searching for ' + key + ' : (Element not found)';
    self.postMessage([root, msg, '']);
    return null;
  }
  else {
    unhighlightAll(root);
    node.highlighted = true;
    self.postMessage([root, msg, '']);
    if (key < node.data) { // if key < current node's data then look at the left subtree
      msg = 'Searching for ' + key + ' : ' + key + ' < ' + node.data + '. Looking at left subtree.';
      self.postMessage([root, msg, '']);
      sleep(delay);
      node.left = pop(node.left, key);
    }
    else if (key > node.data) { // if key > current node's data then look at the right subtree
      msg = 'Searching for ' + key + ' : ' + key + ' > ' + node.data + '. Looking at right subtree.';
      self.postMessage([root, msg, '']);
      sleep(delay);
      node.right = pop(node.right, key);
    }
    else {
      msg = key + ' == ' + node.data + '. Found node to delete.'; // notify the main thread that node to delete is found.
      self.postMessage([root, msg, '']);
      sleep(delay);
      if (!node.left && !node.right) { // if node has no child (is a leaf) then just delete it.
        msg = 'Node to delete is a leaf. Delete it.';
        node = null;
        self.postMessage([root, msg, '']);
      }
      else if (!node.left) { // if node has RIGHT child then set parent of deleted node to right child of deleted node
        msg = 'Node to delete has no left child.\nSet parent of deleted node to right child of deleted node';
        self.postMessage([root, msg, '']);
        sleep(delay);
        // CODE FOR BLINKING ANIMATION AND BLA BLA BLA..
        for (let i = 0; i < 2; i += 1) {
          node.right.highlighted = true;
          if (node === root) node.highlighted = true;
          else node.parent.highlighted = true;
          self.postMessage([root, msg, '']);
          sleep(delay / 2);
          node.right.highlighted = false;
          if (node === root) node.highlighted = false;
          else node.parent.highlighted = false;
          self.postMessage([root, msg, '']);
          sleep(delay / 2);
        }
        // END CODE FOR BLINKING ANIMATION AND BLA BLA BLA..
        let del = node;
        node.right.parent = node.parent;
        node.right.loc = node.loc;
        node = node.right;
        del = null;
        node.y -= 40;
      }
      else if (!node.right) { // if node has LEFT child then set parent of deleted node to left child of deleted node
        msg = 'Node to delete has no right child.\nSet parent of deleted node to left child of deleted node';
        self.postMessage([root, msg, '']);
        sleep(delay);
        for (let i = 0; i < 2; i += 1) {
          node.left.highlighted = true;
          if (node === root) node.highlighted = true;
          else node.parent.highlighted = true;
          self.postMessage([root, msg, '']);
          sleep(delay / 2);
          node.left.highlighted = false;
          if (node === root) node.highlighted = false;
          else node.parent.highlighted = false;
          self.postMessage([root, msg, '']);
          sleep(delay / 2);
        }
        let del = node;
        node.left.parent = node.parent;
        node.left.loc = node.loc;
        node = node.left;
        del = null;
        node.y -= 40;
      }
      else { // if node has TWO children then find largest node in the left subtree. Copy the value of it into node to delete. After that, recursively delete the largest node in the left subtree
        msg = 'Node to delete has two children.\nFind largest node in left subtree.';
        self.postMessage([root, msg, '']);
        sleep(delay);
        let largestLeft = node.left;
        while (largestLeft.right) {
          unhighlightAll(root);
          largestLeft.highlighted = true;
          self.postMessage([root, msg, '']);
          sleep(delay / 2);
          largestLeft = largestLeft.right;
        }
        unhighlightAll(root);
        largestLeft.highlighted = true;
        msg = 'Largest node in left subtree is ' + largestLeft.data + '.\nCopy largest value of left subtree into node to delete.';
        self.postMessage([root, msg, '']);
        sleep(delay);
        // CODE FOR BLINKING ANIMATION AND BLA BLA BLA...
        for (let i = 0; i < 2; i += 1) {
          largestLeft.highlighted = true;
          node.highlighted = true;
          self.postMessage([root, msg, '']);
          sleep(delay / 2);
          largestLeft.highlighted = false;
          node.highlighted = false;
          self.postMessage([root, msg, '']);
          sleep(delay / 2);
        }
        // END CODE FOR BLINKING ANIMATION AND BLA BLA BLA...
        node.data = largestLeft.data;
        unhighlightAll(root);
        self.postMessage([root, msg, '']);
        sleep(delay);
        msg = 'Recursively delete largest node in left subtree';
        self.postMessage([root, msg, '']);
        sleep(delay);
        node.left = pop(node.left, largestLeft.data);
      }
    }
  }
  if (node == null) return node;

  node.height = Math.max(getHeight(node.left), getHeight(node.right)) + 1; // update the heights of all nodes traversed by the pop() function

  return node; // return the modifications back to the caller
}

function deleteKey(curr, key) {
  search(curr, key);
  updatePosition(root);
  unhighlightAll(root);
  sleep(delay);
  return pop(root, key);
}

// INSERT AN ELEMENT TO THE TREE
function push(node, data, posY, parent, loc) {
  let curr = node;

  if (curr != null) { // highlight current node in each recursion step
    curr.highlighted = true;
    self.postMessage([root, msg, '']);
  }

  if (curr == null) { // if current node is null then place the new node there
    msg = 'Found a null node. Inserted ' + data + '.';
    curr = new Node(data, 1, posY, parent, loc);
  }
  else if (data < curr.data) { // if new data < current node's data, then go to left subtree
    msg = data + ' < ' + curr.data + '. Looking at left subtree.';
    self.postMessage([root, msg, '']);
    sleep(delay);
    curr.highlighted = false;
    curr.left = push(curr.left, data, posY + 40, curr, 'left');
  }
  else if (data >= curr.data) { // if new data >= current node's data, then go to right subtree
    msg = data + ' >= ' + curr.data + '. Looking at right subtree.';
    self.postMessage([root, msg, '']);
    sleep(delay);
    curr.highlighted = false;
    curr.right = push(curr.right, data, posY + 40, curr, 'right');
  }

  curr.height = Math.max(getHeight(curr.left), getHeight(curr.right)) + 1; // update the heights of all nodes traversed by the push() function

  return curr; // return the modifications back to the caller
}

// INSERT AN ELEMENT TO THE SPLAY TREE
function insert(node, key, posY) {
  if (node == null) {
    msg = 'Found a null root. Inserted ' + key + '.';
    self.postMessage([root, msg, '']);
    root = new Node(key, 1, posY, null, 'root');
    return;
  }
  else {
    node.highlighted = true;
    msg = "";
    self.postMessage([root, msg, '']);
  }

  if (node.left == null && node.data > key) {
    sleep(delay);
    msg = 'Inserted ' + key + ' and apply splay(' + key + ').';
    self.postMessage([root, msg, '']);
    node.highlighted = false;
    splay(node);
    let l = new Node(
      key,
      1,
      posY + 40,
      node,
      'left'
    );
    if(node.left) {
      node.left.parent = l;
      l.left = node.left;
    }
    node.left = l;
    splay(l);
    return;
  }

  else if (node.right == null && key > node.data) {
    sleep(delay);
    msg = 'Inserted ' + key + ' and apply splay(' + key + ').';
    self.postMessage([root, msg, '']);
    node.highlighted = false;
    splay(node);
    let r = new Node(
      key,
      1,
      posY + 40,
      node,
      'right'
    );
    if(node.right) {
      node.right.parent = r;
      r.right = node.right;
    }
    node.right = r;
    splay(r);
    return;
  }


  else if (key < node.data) {
    msg = key + ' < ' + node.data + '. Looking at left subtree.';
    self.postMessage([root, msg, '']);
    sleep(delay);
    node.highlighted = false;
    return insert(node.left, key, posY + 40);
  }

  else if (key > node.data) {
    msg = key + ' > ' + node.data + '. Looking at right subtree.';
    self.postMessage([root, msg, '']);
    sleep(delay);
    node.highlighted = false;
    return insert(node.right, key, posY + 40);
  }

  else { //duplicate key, so update the value
    msg = 'Found a duplicated node. Inserted.';
    self.postMessage([root, msg, '']);
    node.highlighted = false;
    splay(node);
    return;
  }

}

// AFTER INSERT OR DELETE, ALWAYS UPDATE ALL NODES POSITION IN THE CANVAS
// FORMULA FOR DETERMINING NODE POSITION IS: (NODE'S PARENT POSITION - ((2 ^ (NODE'S CURRENT HEIGHT + 1)) * 10)))
function updatePosition(node) {
  if (node != null) {
    if (node.loc === 'left') node.x = node.parent.x - ((2 ** (getHeight(node.right) + 1)) * 10);
    else if (node.loc === 'right') node.x = node.parent.x + ((2 ** (getHeight(node.left) + 1)) * 10);
    else if (node.loc === 'root') {
      node.x = canvasWidth / 2;
      node.y = 50;
    }
    if (node.parent != null) node.y = node.parent.y + 40;
    if (node.left != null) node.left.parent = node; // update parent information of current node
    if (node.right != null) node.right.parent = node; // update parent information of current node
    updatePosition(node.left);
    updatePosition(node.right);
  }
}

// PRINT ALL NODES PRE-ORDERLY. THE ROUTE IS C - L - R
function printPreOrder(node) {
  if (node !== null) {
    unhighlightAll(root);
    node.highlighted = true;
    msg = 'Printing the value';
    printOutput = node.data;
    self.postMessage([root, msg, printOutput + ' ', '']);
    sleep(delay);
    msg = 'Going to left subtree';
    self.postMessage([root, msg, '', '']);
    sleep(delay);

    printPreOrder(node.left);

    unhighlightAll(root);
    node.highlighted = true;
    msg = 'Going to right subtree';
    self.postMessage([root, msg, '', '']);
    sleep(delay);

    printPreOrder(node.right);

    unhighlightAll(root);
    node.highlighted = true;
    msg = 'Going back up';
    self.postMessage([root, msg, '', '']);
    sleep(delay);
  }
  else {
    msg += '... NULL';
    self.postMessage([root, msg, '', '']);
    sleep(delay);
  }
}

// PRINT ALL NODES IN-ORDERLY. THE ROUTE IS L - C - R
function printInOrder(node) {
  if (node !== null) {
    unhighlightAll(root);
    node.highlighted = true;
    msg = 'Going to left subtree';
    self.postMessage([root, msg, '', '']);
    sleep(delay);

    printInOrder(node.left);

    msg = 'Printing the value';
    printOutput = node.data;
    unhighlightAll(root);
    node.highlighted = true;
    self.postMessage([root, msg, printOutput + ' ', '']);
    sleep(delay);
    msg = 'Going to right subtree';
    self.postMessage([root, msg, '', '']);
    sleep(delay);

    printInOrder(node.right);

    unhighlightAll(root);
    node.highlighted = true;
    msg = 'Going back up';
    self.postMessage([root, msg, '', '']);
    sleep(delay);
  }
  else {
    msg += '... NULL';
    self.postMessage([root, msg, '', '']);
    sleep(delay);
  }
}

// PRINT ALL NODES POST-ORDERLY. THE ROUTE IS L - R - C
function printPostOrder(node) {
  if (node !== null) {
    unhighlightAll(root);
    node.highlighted = true;
    msg = 'Going to left subtree';
    self.postMessage([root, msg, '', '']);
    sleep(delay);

    printPostOrder(node.left);

    unhighlightAll(root);
    node.highlighted = true;
    msg = 'Going to right subtree';
    self.postMessage([root, msg, '', '']);
    sleep(delay);

    printPostOrder(node.right);

    msg = 'Printing the value';
    printOutput = node.data;
    unhighlightAll(root);
    node.highlighted = true;
    self.postMessage([root, msg, printOutput + ' ', '']);
    sleep(delay);
    msg = 'Going back up';
    self.postMessage([root, msg, '', '']);
    sleep(delay);
  }
  else {
    msg += '... NULL';
    self.postMessage([root, msg, '', '']);
    sleep(delay);
  }
}

// EVENT LISTENER TO LISTEN COMMANDS FROM THE MAIN THREAD. THE TREE WILL EXECUTE EVERYTHING THE MAIN THREAD WANTS.
// AT EACH STEP IN THE ALGORITHM, THE TREE WILL NOTIFY THE MAIN THREAD ABOUT CHANGES IN THE TREE SO THE MAIN THREAD CAN DISPLAY THE CHANGES STEP-BY-STEP TO USERS FOR EASIER UNDERSTANDING
self.addEventListener('message', (event) => {
  switch (event.data[0]) {
    case 'Insert': {
      lastState = treeClone(root); // save last state of the tree before inserting
      const value = event.data[1]; // get value from user input
      canvasWidth = event.data[2]; // get canvasWidth from main thread. Important for node positioning
      root = push(root, value, 50, null, 'root'); // push it
      updatePosition(root); // update all node position
      self.postMessage([root, msg, 'Finished']); // let main thread know that operation has finished
      break;
    }
    case 'InsertSplay': {
      lastState = treeClone(root); // save last state of the tree before inserting
      const value = event.data[1]; // get value from user input
      canvasWidth = event.data[2]; // get canvasWidth from main thread. Important for node positioning
      insert(root, value, 50, null); // push it
      updatePosition(root); // update all node position
      unhighlightAll(root); // unhighlight all nodes
      self.postMessage([root, msg, 'Finished']); // let main thread know that operation has finished
      break;
    }
    case 'Delete': {
      lastState = treeClone(root); // save last state of the tree before deleting
      const key = event.data[1]; // get value from user input
      if (root == null) {
        self.postMessage([root, 'Tree is empty', 'Finished']); // send message to main thread that the tree is empty
      }
      else {
        root = pop(root, key); // delete it
        updatePosition(root); // update the node position
        unhighlightAll(root); // unhighlight all nodes
        self.postMessage([root, msg, 'Finished']); // let main thread know that operation has finished
      }
      break;
    }
    case 'DeleteSplay': {
      lastState = treeClone(root); // save last state of the tree before deleting
      const key = event.data[1]; // get value from user input
      if (root == null) {
        self.postMessage([root, 'Tree is empty', 'Finished']); // send message to main thread that the tree is empty
      }
      else {
        root = deleteKey(root, key); // delete it
        updatePosition(root); // update the node position
        unhighlightAll(root); // unhighlight all nodes
        self.postMessage([root, msg, 'Finished']); // let main thread know that operation has finished
      }
      break;
    }
    case 'Find': {
      const key = event.data[1]; // get value from user input
      if (root == null) {
        self.postMessage([root, 'Tree is empty', 'Finished']); // send message to main thread that the tree is empty
      }
      else {
        lastState = treeClone(root); // save last state of the tree before searching
        search(root, key);
        updatePosition(root);
        unhighlightAll(root); // unhighlight all nodes
        self.postMessage([root, msg, 'Finished']); // let main thread know that operation has finished
      }
      break;
    }
    case 'Print Pre Order': {
      if (root == null) {
        self.postMessage([root, 'Tree is empty', '', 'Finished']); // send message to main thread that the tree is empty
      }
      else {
        printPreOrder(root);
        unhighlightAll(root); // unhighlight all nodes after operation
        self.postMessage([root, 'Print Finished', '', 'Finished']); // let main thread know that operation has finished
      }
      break;
    }
    case 'Print In Order': {
      if (root == null) {
        self.postMessage([root, 'Tree is empty', '', 'Finished']); // send message to main thread that the tree is empty
      }
      else {
        printInOrder(root);
        unhighlightAll(root); // unhighlight all nodes after operation
        self.postMessage([root, 'Print Finished', '', 'Finished']); // let main thread know that operation has finished
      }
      break;
    }
    case 'Print Post Order': {
      if (root == null) {
        self.postMessage([root, 'Tree is empty', '', 'Finished']); // send message to main thread that the tree is empty
      }
      else {
        printPostOrder(root);
        unhighlightAll(root); // unhighlight all nodes after operation
        self.postMessage([root, 'Print Finished', '', 'Finished']); // let main thread know that operation has finished
      }
      break;
    }
    case 'Undo': {
      root = treeClone(lastState); // replace contents of current tree with the last tree state
      updatePosition(root); // update node position
      self.postMessage([root, '', 'Finished']); // let main thread know that operation has finished
      break;
    }
    case 'Set Animation Speed': {
      delay = event.data[1]; // get delay value from user input (slider)
      break;
    }
    default: break;
  }
});
