<?php
 /* called by nutSearch() js function in main.js */
    require 'db.inc';
    
    $mysqli=  @ new mysqli($server,$user,$password, $database);
    
    /* check connection */
    if ($mysqli->connect_errno) {
        printf("Connect failed: %s\n", $mysqli->connect_error);
        exit();
    }
	
    if (!isset($_POST['nutSearch']) || trim($_POST['nutSearch']) === '') {
		echo "No Match";
		return;
	}
	
	$f =($_POST['nutSearch']);	
    
 /*   $sql = "SELECT walnutID FROM nuts WHERE SirName LIKE CONCAT(?,'%') LIMIT 1";  */
	
    if (!($stmt = $mysqli->prepare("SELECT walnutID FROM nuts WHERE SirName LIKE CONCAT(?,'%') LIMIT 1"))){
        echo "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
    }
	
    // Bind parameters (an integer and a string). 'is' tells MySQL you're passing an integer(i) and a string(s)
    $stmt->bind_param('s', $f); 

    if ($stmt == false) 
    { // bind error
        printf("bind_param error: %s %d\n",$stmt->error,$stmt->errno);
        return;
    }
	if (!$stmt->execute()) {
		echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
	}
	
	if (!($res = $stmt->get_result())) {
		echo "Getting result set failed: (" . $stmt->errno . ") " . $stmt->error;
	}
	
	/* fetch object array */
    If (!($row = $res->fetch_assoc())) {
		echo "No Match";
	}

    print $row["walnutID"];
    
    // Free system resources.
    mysqli_stmt_free_result($stmt);
 
      // Disconnect from database.
    mysqli_close($mysqli);         
          
?>