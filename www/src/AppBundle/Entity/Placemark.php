<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="AppBundle\Repository\PlacemarkRepository")
 *
 * @ORM\Table(name="placemarkers")
 */
class Placemark
{

    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    protected $id;

    /**
     * @ORM\Column(type="string")
     */
    protected $name;


    /**
     * @ORM\Column(type="decimal")
     */
    protected $lat;


    /**
     * @ORM\Column(type="decimal")
     */
    protected $lon;


    public function getId()
    {
        return $this->id;
    }

    public function getName()
    {
        return $this->name;
    }

    public function setName($name)
    {
        $this->name = $name;

        return $this;
    }


    public function getLat()
    {

        return $this->lat;
    }

    public function setLat($lat)
    {
        $this->lat = $lat;

        return $this;
    }

    public function getLon()
    {

        return $this->lon;
    }

    public function setLon($lon)
    {
        $this->lon = $lon;

        return $this;
    }
}