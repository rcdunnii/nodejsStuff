<?php
		require 'db.inc';
       
		// make connection to mysql server
		$mysqli = new mysqli($server,$user,$password, $database );
		if ($mysqli->connect_errno) {
			echo 'Error: File' . __FILE__ . 'line#' .__LINE__ . $mysqli->connect_error;
			$mysqli->close();
			return false;
		}
        
        if ($_GET["value"] == "byDate")
        {
            $stmt = $mysqli->prepare("SELECT * FROM  `bdays` ORDER BY bDayMM, bDayDD");
        } else {
            $stmt = $mysqli->prepare("SELECT * FROM `bdays` ORDER BY LastName, FirstName");
        }
	
		if ($stmt == false) 
		{ // bind error
			printf("bind_param error: %s %d\n",$stmt->error,$stmt->errno);
			return;
		}

		$stmt->execute();
		
		if($stmt == false)
		{
			printf("execute: %s %d\n",$stmt->error,$stmt->errno);
			return;
		} else {						
			if (!($res = $stmt->get_result())) {
				echo "Getting result set failed: (" . $stmt->errno . ") " . $stmt->error;
			}
			/* declare array variable to contain all the database records */
			$results = array();
			/* get the database data into $results array to allow us to format/present it... */
			while ($row = $res->fetch_assoc()) {
				$results[] = $row;
			}
			$stmt->close();
			$mysqli->close();
            $outPut = json_encode($results);
		    echo $outPut;  
		}

?>