<?php
   
   function createNutsDBs() {
        require_once('dbFoxy.inc');  // database info
        /* create database   */
		
		$mysqli = new mysqli($server, $user, $password);

		/* check connection */
		if ($mysqli->connect_errno) {
			printf("Connect failed: %s\n", $mysqli->connect_error);
			exit();
		}
		
		/* sql query with CREATE DATABASE */
		$sql = "CREATE DATABASE $database DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci";

		// Performs the $sql query on the server to create the database
		$res = $mysqli->query($sql) ;

		if ($mysqli->error) {
			try {
    		    throw new Exception("MySQL error $mysqli->error ", $mysqli->errno);
			} catch(Exception $e ) { 
                echo "Error No: ".$e->getCode(). " - ". $e->getMessage();                        
			}
			$mysqli->close();
			return false;
		}
        
        $mysqli = new mysqli($server, $user, $password, $database);
		if ($mysqli->connect_errno) {
			die( 'Error: File:' . __FILE__ . 'line#' . __LINE__ . $mysqli->errno); 
		}
					
		$sql = "CREATE TABLE bdays 
			(
			bDayID int NOT NULL AUTO_INCREMENT,
            PRIMARY KEY (bDayID),
			FirstName varchar(30) NOT NULL,
            MiddleInit char(2) NULL,            
			LastName varchar(50) NOT NULL,					
			bDayYYYY char(4) NULL,
            bDayMM char(3) NOT NULL,
            bDayDD char(2) NOT NULL,
            WalnutID int,
            INDEX name (LastName, MiddleInit, FirstName),
            INDEX bdMonth (bDayMM),
            INDEX bDayDD (bDayDD)
			)";
			
		// Performs the $sql query on the server to create the table
		$res = $mysqli->query($sql);
		
		if ($mysqli->error) {
			try {    
				throw new Exception("MySQL error $mysqli->error <br> Query:<br> $sql", $mysqli->errno);    
			} catch(Exception $e ) {
				echo "Error No: ".$e->getCode(). " - ". $e->getMessage() . "<br >";
				echo nl2br($e->getTraceAsString());
				}
			$mysqli->close();
			return;
		}
					
		$sql = "CREATE TABLE nuts 
			(
			walnutID int NOT NULL AUTO_INCREMENT, 	/* numeric key for this record */
			PRIMARY KEY(walnutID),                	/* make it primary key */
			SirName varchar(20),					/* Generic Sirname - e.g. Dunn */	
			Names varchar(50),						/* Names - e.g. Bob and Sarah Skinner Dunn	*/
			FormalNames varchar(50),				/* Letter Address - e.g. Dr. and Mrs Robert C Dunn Jr */
			Children varchar(50),					/* Children's Names, ages etc */
			Addr1 varchar(35),						/* Street */
			Addr2 varchar(35),						/* Apt, business */
			Addr3 varchar(35),						/* Country, State, Zip */
			Addr4 varchar(35),						/* Misc */			
			Email1 varchar(30),						/* Email addresses */
			Email2 varchar(30),
			Email3 varchar(30),
			Phone1 varchar(30),						/* Phone 1 */
			Phone2 varchar(30),						/* Phone 2 */
			Notes varchar(50),						/* Notes */			
            Created DATETIME NOT NULL DEFAULT '1900-01-01 00:00:00',                          /* column to set date created   */
            Updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  /* column set to date updated   */
			)";
			
		// Performs the $sql query on the server to create the table
		$res = $mysqli->query($sql);
		
		if ($mysqli->error) {
			try {    
				throw new Exception("MySQL error $mysqli->error <br> Query:<br> $sql", $mysqli->errno);    
			} catch(Exception $e ) {
				echo "Error No: ".$e->getCode(). " - ". $e->getMessage() . "<br >";
				echo nl2br($e->getTraceAsString());
				}
			$mysqli->close();
			return;
		}
        
		// Set a trigger to set a time value for 'Created' field of nuts table whenever a new nut is added to the db
        $sql = "CREATE TRIGGER NUT_CREATED BEFORE INSERT ON nuts FOR EACH ROW SET NEW.Created = NOW()";
     		
		$res = $mysqli->query($sql);
        
        if ($mysqli->error) {
			try {    
				throw new Exception("MySQL error $mysqli->error <br> Query:<br> $sql", $mysqli->errno);    
			} catch(Exception $e ) {
				echo "Error No: ".$e->getCode(). " - ". $e->getMessage() . "<br >";
				echo nl2br($e->getTraceAsString());
				}
			$mysqli->close();
			return;
		}
        
        $sql = "CREATE TABLE hash
        (
            Walnut text NOT NULL,
            Foxy text NOT NULL
        )";

        $res = $mysqli->query($sql);
        
        if ($mysqli->error) {
			try {    
				throw new Exception("MySQL error $mysqli->error <br> Query:<br> $sql", $mysqli->errno);    
			} catch(Exception $e ) {
				echo "Error No: ".$e->getCode(). " - ". $e->getMessage() . "<br >";
				echo nl2br($e->getTraceAsString());
				}
			$mysqli->close();
			return;
		}
        
		echo "$database successfully created!";		
		$mysqli->close();
		return;		
	}
	
	function deleteNutsDBs() {
        require_once('dbFoxy.inc');  // database info
        
		$mysqli = @ new mysqli($server, $user, $password, $database);
		
		/* check connection */
		if ($mysqli->connect_errno) {
			printf("Connect failed: %s\n", $mysqli->connect_error);
			exit();
		}
		
		$res = $mysqli->query("DROP DATABASE IF EXISTS $database");
		
		if ($mysqli->error) {
			try {    
				throw new Exception("MySQL error $mysqli->error <br> Query:<br> $sql", $mysqli->errno);    
			} catch(Exception $e ) {
				echo "Error No: ".$e->getCode(). " - ". $e->getMessage() . "<br >";
				echo nl2br($e->getTraceAsString());
				}
			$mysqli->close();
			return;
		}
        
        $mysqli->close();
      
		echo "Ouch... Databases deleted";

		return;					
	}
	
    function backUpDB() {
        require_once('dbFoxy.inc');  // database info
        
        $dir = "db_backup";  
        //if the db directory doesn't exist yet, create it
        if (!is_dir($dir))
            mkdir($dir);  
        //create the file name for the backup 
        $BU = $dir.'/nutDB_'.date("m-d-Y_H-i-s").'.sql';
        $result = 0;
        $log = $dir.'/dblog';  
        //make the system call to mysqldump
		
		if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            if (file_exists("C:/xampp/")) {
                $mysqldump = "C:/xampp/mysql/bin/mysqldump.exe";
            } else if (file_exists("D:/xampp/")) {
                $mysqldump = "D:/xampp/mysql/bin/mysqldump.exe";
            }             
		} else {
			$mysqldump = "/usr/bin/mysqldump";
		}
		
        exec("$mysqldump --user=$user --password=$password --host=$server  $database  > $BU", $output, $result);
		
        if ($result == 0) {           
           echo ("<p>Backup OK!<br /><a class=\"downLoad\" href=\"$BU\" download>Click to Download</a>&nbsp;&nbsp;&nbsp;<a class= \"downLoad\" href=\"#\" >Skip Download</a></p>");
        } else {
            echo ("Backup failed with error # " . $result);
        }
}

/*    require_once('dbFoxy.inc');  // database info  */
    
	if (($_REQUEST['value']) != "") {
	   $whichDashBoardOpt = $_REQUEST['value'];
	   if ($whichDashBoardOpt == "createNutsDBs") {
           createNutsDBs();
	   } elseif ($whichDashBoardOpt == "deleteNutsDBs") {				
		   deleteNutsDBs();
	   } elseif ($whichDashBoardOpt == "bkUpDB") {      
           backUpDB();          
       } else {
		   echo "Uh oh...";			   
	   }  
	} else {
		echo "please enter choice before submitting the form!";
		return;
	}
	
?>
