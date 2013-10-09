<?php
	require 'db.inc';
		
	$mysqli = @ new mysqli($server, $user, $password, $database);
		
	/* check connection */
	if ($mysqli->connect_errno) {
		printf("Connect failed: %s\n", $mysqli->connect_error);
		exit();
	}
	
	$nutID = $_GET['value'];			

	if (!($stmt = $mysqli->prepare("SELECT * FROM nuts WHERE walnutID = {$nutID}"))	){
		echo "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
	}
	
	if (!$stmt->execute()) {
		echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
	}
	
	if (!($res = $stmt->get_result())) {
		echo "Getting result set failed: (" . $stmt->errno . ") " . $stmt->error;
	}
	
	/* fetch object array */
    If (!($row = $res->fetch_assoc())) {
		echo "fetch of row from DB failed: (" . $stmt->errno . ") " . $stmt->error;
	}


	echo json_encode($row);
    
    exit;			
	
?> 
			