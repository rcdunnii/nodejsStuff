<?php
    /* called by printNuts() js function in main.js */
    require 'db.inc';
    
    $mysqli=  @ new mysqli($server,$user,$password, $database);
    
    /* check connection */
    if ($mysqli->connect_errno) {
        printf("Connect failed: %s\n", $mysqli->connect_error);
        exit();
    }
    /* sent obj {data : nutID array} - get data array    */
    $f =($_POST['data']); 

    if (!($stmt = $mysqli->prepare("SELECT * FROM nuts WHERE walnutID IN (" . implode(',', array_map('intval', $f)) . ")"))) {
        echo "Prepare failed: (" . $mysqli->errno . ") " . $mysqli->error;
	}
	
	if (!$stmt->execute()) {
		echo "Execute failed: (" . $stmt->errno . ") " . $stmt->error;
	}
	
	if (!($result = $stmt->get_result())) {
		echo "Getting result set failed: (" . $stmt->errno . ") " . $stmt->error;
	}
	
    $printArray = array();
    
    while($row = $result->fetch_assoc()) {
        $printArray[] = $row;
    }

	echo json_encode($printArray);
			
		return;									

?>